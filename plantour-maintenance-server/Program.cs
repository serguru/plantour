using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AutoMapper;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.HttpOverrides;
using Npgsql;
using plantour_server.DbModels;
using plantour_maintenance_server.Middleware;
using plantour_maintenance_server.Models;
using plantour_maintenance_server.Repositories;
using plantour_maintenance_server.Services;
using plantour_maintenance_server.Services.Interfaces;

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var rawEnvironmentName =
    Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")
    ?? Environment.GetEnvironmentVariable("DOTNET_ENVIRONMENT");

var envs = new List<string> { "Development", "QA", "Production" };

if (string.IsNullOrWhiteSpace(rawEnvironmentName) || !envs.Contains(rawEnvironmentName))
{
    throw new CustomException($"No environment specified. Must be {string.Join(',', envs)}.");
}

var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
    EnvironmentName = rawEnvironmentName
});

builder.Logging.ClearProviders();

builder.Configuration.Sources.Clear();
builder.Configuration
    .SetBasePath(builder.Environment.ContentRootPath)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: false, reloadOnChange: true)
    .AddEnvironmentVariables();

if (args.Length > 0)
{
    builder.Configuration.AddCommandLine(args);
}

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders =
        ForwardedHeaders.XForwardedFor |
        ForwardedHeaders.XForwardedProto |
        ForwardedHeaders.XForwardedHost;

    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
    options.ForwardLimit = null;
    options.RequireHeaderSymmetry = false;
});

builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();
builder.Services.AddControllers();
builder.Services.AddHttpContextAccessor();
builder.Services.AddMemoryCache();

builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));
var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>()
    ?? throw new InvalidOperationException("JwtSettings configuration is missing.");

builder.Services.Configure<PaddleSettings>(builder.Configuration.GetSection("PaddleSettings"));

builder.Services.Configure<PasswordHashSettings>(builder.Configuration.GetSection("PasswordHashSettings"));
var passwordHashSettings = builder.Configuration.GetSection("PasswordHashSettings").Get<PasswordHashSettings>()
    ?? throw new InvalidOperationException("PasswordHashSettings configuration is missing.");

if (string.IsNullOrWhiteSpace(passwordHashSettings.Secret) || string.IsNullOrWhiteSpace(passwordHashSettings.Salt))
{
    throw new InvalidOperationException("PasswordHashSettings secret and salt must both be configured.");
}

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("ConnectionStrings:DefaultConnection is missing.");

var jwtKey = Encoding.UTF8.GetBytes(jwtSettings.SecretKey);

var dataSourceBuilder = new NpgsqlDataSourceBuilder(connectionString);
dataSourceBuilder.ConnectionStringBuilder.Timezone = "UTC";
var dataSource = dataSourceBuilder.Build();

builder.Services.AddDbContext<PlantourContext>(options => options.UseNpgsql(dataSource));

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.MapInboundClaims = false;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(jwtKey),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidateAudience = true,
        ValidAudience = jwtSettings.Audience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero,
        NameClaimType = JwtRegisteredClaimNames.Sub
    };
    options.Events = new JwtBearerEvents
    {
        OnTokenValidated = context =>
        {
            var emailClaim = context.Principal?.FindFirst(MaintenanceClaims.Email)?.Value;
            if (string.IsNullOrWhiteSpace(emailClaim))
            {
                context.Fail("Email claim is missing.");
            }

            return Task.CompletedTask;
        },
        OnChallenge = async context =>
        {
            context.HandleResponse();
            await ErrorResponse.WriteErrorResponse(
                context.HttpContext,
                StatusCodes.Status401Unauthorized,
                "WRONG_TOKEN",
                "Sign-in required");
        }
    };
});

builder.Services.AddAuthorization(options =>
{
    options.FallbackPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
});

builder.Services.AddAutoMapper(_ => { }, typeof(Program).Assembly);

builder.Services.AddScoped<CurrentSuperuserAccessor>();
builder.Services.AddScoped<ApiVisitRepository>();
builder.Services.AddScoped<LogRepository>();
builder.Services.AddScoped<SuperuserRepository>();
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ILogsService, LogsService>();
builder.Services.AddScoped<IUsersService, UsersService>();
builder.Services.AddScoped<IVisitorActivityService, VisitorActivityService>();
builder.Services.AddHttpClient<IPlantourUsersService, PlantourUsersService>(client =>
{
    client.Timeout = TimeSpan.FromSeconds(30);
});
builder.Services.AddHttpClient<IIpGeolocationService, IpwhoisGeolocationService>(client =>
{
    client.BaseAddress = new Uri("https://ipwho.is/");
    client.Timeout = TimeSpan.FromSeconds(8);
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowOrigins", policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            policy.AllowAnyOrigin()
                .AllowAnyHeader()
                .AllowAnyMethod();
            return;
        }

        var allowedOrigins = builder.Configuration.GetSection("CorsSettings:AllowedOrigins").Get<string[]>();
        if (allowedOrigins == null || allowedOrigins.Length == 0)
        {
            throw new InvalidOperationException("CorsSettings:AllowedOrigins must contain at least one origin outside Development.");
        }

        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddOpenApi();

var app = builder.Build();

app.UseForwardedHeaders();
app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors("AllowOrigins");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
