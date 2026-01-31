using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
//using plantour_server.Authorization;
using plantour_server.Models;
using plantour_server.Services.Interfaces;
using plantour_server.DbModels;
using plantour_server.Services;
using PlantourApi.Authorization;
using PlantourApi.Models;
using System.Text;
using PlantourApi.Middleware;
using QuestPDF.Infrastructure;
using System.Text.Json;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Serilog;
using Serilog.Events;
using Serilog.Settings.Configuration;
using Serilog.Sinks.PostgreSQL;
using NpgsqlTypes;

QuestPDF.Settings.License = LicenseType.Community;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog with explicit column mappings for PostgreSQL
var columnOptions = new Dictionary<string, ColumnWriterBase>
{
    { "message_template", new RenderedMessageColumnWriter(NpgsqlDbType.Text) },
    { "level", new LevelColumnWriter(true, NpgsqlDbType.Varchar) },
    { "time_stamp", new TimestampColumnWriter(NpgsqlDbType.Timestamp) },
    { "exception", new ExceptionColumnWriter(NpgsqlDbType.Text) },
    { "log_event", new LogEventSerializedColumnWriter(NpgsqlDbType.Text) },
    { "properties", new PropertiesColumnWriter(NpgsqlDbType.Jsonb) }
};

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

Serilog.Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Is(builder.Environment.IsDevelopment()
        ? LogEventLevel.Information
        : LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .Enrich.WithEnvironmentUserName()
    .Enrich.WithMachineName()
    .Enrich.WithProcessId()
    .WriteTo.PostgreSQL(
        connectionString: connectionString,
        tableName: "logs",
        columnOptions: columnOptions,
        schemaName: "plantour",
        needAutoCreateTable: false
    )
    .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}")
    .CreateLogger();

try
{
    Serilog.Log.Information("Starting Plantour API application");

    builder.Host.UseSerilog();

    builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
    builder.Services.AddProblemDetails();

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddHttpContextAccessor();
builder.Services.AddDataProtection();

// Configure Temporary User settings
var tempUserSettings = builder.Configuration.GetSection("TemporaryUserSettings");
builder.Services.Configure<TemporaryUserSettings>(tempUserSettings);
// Configure JWT settings
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
builder.Services.Configure<JwtSettings>(jwtSettings);

// Configure Brevo settings
builder.Services.Configure<BrevoSettings>(builder.Configuration.GetSection("BrevoSettings"));

// Configure Gemini settings
builder.Services.Configure<GeminiSettings>(builder.Configuration.GetSection("GeminiSettings"));

var jwtConfig = jwtSettings.Get<JwtSettings>();
var key = Encoding.UTF8.GetBytes(jwtConfig!.SecretKey);

// Configure PostgreSQL connection
builder.Services.AddDbContext<PlantourContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configure JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.MapInboundClaims = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = jwtConfig.Issuer,
        ValidateAudience = true,
        ValidAudience = jwtConfig.Audience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero,
        NameClaimType = ClaimTypes.NameIdentifier,
        RoleClaimType = ClaimTypes.Role
    };
    options.Events = new JwtBearerEvents
    {

        // 3. Срабатывает, если валидация провалилась (истек срок, неверная подпись и т.д.)
        OnAuthenticationFailed = context =>
        {
            return Task.CompletedTask;
        },

        OnForbidden = context =>
        {
            return Task.CompletedTask;
        },

        OnMessageReceived = context =>
        {
            //var accessToken = context.Request.Query["access_token"];
            // if (!string.IsNullOrEmpty(accessToken)) context.Token = accessToken;
            return Task.CompletedTask;
        },

        // 2. Срабатывает ПОСЛЕ успешной валидации (здесь можно добавить свои проверки)
        OnTokenValidated = context =>
        {
            // Достаем email из уже расшифрованных claims
            var emailClaim = context.Principal?.FindFirst(PlantourClaims.Email);

            if (emailClaim == null || string.IsNullOrEmpty(emailClaim.Value))
            {
                // Сообщаем системе, что токен нам не подходит
                context.Fail("Email claim is missing");
            }

            return Task.CompletedTask;
        },

        OnChallenge = async context =>
        {
            context.HandleResponse();

            string errorCode = "WRONG_TOKEN";

            var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();

            if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer "))
            {
                var token = authHeader.Substring("Bearer ".Length).Trim();
                var handler = new JwtSecurityTokenHandler();

                if (handler.CanReadToken(token))
                {
                    try
                    {
                        var jwtToken = handler.ReadJwtToken(token);
                        var role = jwtToken.Claims.FirstOrDefault(c => c.Type == PlantourClaims.Role)?.Value;

                        errorCode = role switch
                        {
                            //                            PlantourRoles.Admin => "WRONG_ADMIN_TOKEN",
                            PlantourRoles.Participant => "WRONG_PARTICIPANT_TOKEN",
                            _ => "WRONG_TOKEN"
                        };
                    }
                    catch
                    {
                        //WRONG_TOKEN
                    }
                }
            }

            await ErrorResponse.WriteErrorResponse(
                context.HttpContext,
                StatusCodes.Status401Unauthorized,
                errorCode,
                "Sign-in required"
            );
        }
    };
});



// Configure Authorization
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy =>
        policy.Requirements.Add(new UserRoleRequirement(UserRole.Admin)));

    options.AddPolicy("ParticipantOnly", policy =>
        policy.Requirements.Add(new UserRoleRequirement(UserRole.Participant)));

    options.AddPolicy("AdminOrParticipant", policy =>
        policy.Requirements.Add(new UserRoleRequirement(UserRole.Admin, UserRole.Participant)));

    options.AddPolicy("Public", policy =>
        policy.Requirements.Add(new UserRoleRequirement(UserRole.Public, UserRole.Participant, UserRole.Admin)));
});

// Register authorization handlers
builder.Services.AddSingleton<IAuthorizationHandler, UserRoleHandler>();

// Register AutoMapper
builder.Services.AddAutoMapper(typeof(Program).Assembly);

// Register services
builder.Services.AddScoped<IUsersService, UsersService>();
builder.Services.AddScoped<IPackageService, PackService>();
builder.Services.AddScoped<IThingService, ThingService>();
builder.Services.AddScoped<ITripService, TripService>();
builder.Services.AddScoped<ITripUserService, TripUserService>();
builder.Services.AddScoped<ITripThingService, TripThingService>();
builder.Services.AddScoped<ITripPackageService, TripPackageService>();
builder.Services.AddScoped<ILookupsService, LookupsService>();
builder.Services.AddScoped<IAdminsParticipantService, AdminsParticipantService>();
builder.Services.AddScoped<ITripSharedService, TripSharedService>();
builder.Services.AddScoped<ICheckAccessService, CheckAccessService>();
builder.Services.AddScoped<ITemplateService, TemplateService>();
builder.Services.AddScoped<ITripCommentService, TripCommentService>();
builder.Services.AddScoped<IDocumentsService, DocumentsService>();
builder.Services.AddScoped<IInvitationService, InvitationService>();
builder.Services.AddScoped<plantour_server.Services.Interfaces.IPublicTemplatesService, PublicTemplatesService>();

builder.Services.AddScoped<ITemporaryUserService, TemporaryUserService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IRefreshTokenService, RefreshTokenService>();
builder.Services.AddScoped<IEmailConfirmationService, EmailConfirmationService>();
builder.Services.AddScoped<IContactSubmissionService, ContactSubmissionService>();

builder.Services.AddHttpClient<IBrevoEmailClient, BrevoEmailClient>();
builder.Services.AddHttpClient<IAiPackingListService, AiPackingListService>();


// Register repositories
builder.Services.AddScoped<plantour_server.Repositories.PackRepository>();
builder.Services.AddScoped<plantour_server.Repositories.ThingRepository>();
builder.Services.AddScoped<plantour_server.Repositories.ThingCategoryRepository>();
builder.Services.AddScoped<plantour_server.Repositories.CommunicationTypeRepository>();
builder.Services.AddScoped<plantour_server.Repositories.UnitRepository>();
builder.Services.AddScoped<plantour_server.Repositories.TripStatusRepository>();
builder.Services.AddScoped<plantour_server.Repositories.ActivityRepository>();
builder.Services.AddScoped<plantour_server.Repositories.GenderRepository>();
builder.Services.AddScoped<plantour_server.Repositories.TemperatureRangeRepository>();
builder.Services.AddScoped<plantour_server.Repositories.AgeRangeRepository>();
builder.Services.AddScoped<plantour_server.Repositories.PlanRepository>();
builder.Services.AddScoped<plantour_server.Repositories.AccessTypeRepository>();
builder.Services.AddScoped<plantour_server.Repositories.TripRepository>();
builder.Services.AddScoped<plantour_server.Repositories.TripUserRepository>();
builder.Services.AddScoped<plantour_server.Repositories.TripThingRepository>();
builder.Services.AddScoped<plantour_server.Repositories.TripPackRepository>();
builder.Services.AddScoped<plantour_server.Repositories.LookupsRepository>();
builder.Services.AddScoped<plantour_server.Repositories.AdminsParticipantRepository>();
builder.Services.AddScoped<plantour_server.Repositories.UsersRepository>();
builder.Services.AddScoped<plantour_server.Repositories.InvitationsRepository>();
builder.Services.AddScoped<plantour_server.Repositories.DicTripRepository>();
builder.Services.AddScoped<plantour_server.Repositories.TripSharedRepository>();
builder.Services.AddScoped<plantour_server.Repositories.TemplateRepository>();
builder.Services.AddScoped<plantour_server.Repositories.TripCommentRepository>();
builder.Services.AddScoped<plantour_server.Repositories.UserRefreshTokenRepository>();
builder.Services.AddScoped<plantour_server.Repositories.UserEmailConfirmationRepository>();
builder.Services.AddScoped<plantour_server.Repositories.ContactSubmissionRepository>();

builder.Services.AddScoped<HttpCurrentUser>();

// Configure CORS for Angular client
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowOrigins", policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            // Allow all origins in development
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        }
        else
        {
            // Use configured origins in production
            var allowedOrigins = builder.Configuration.GetSection("CorsSettings:AllowedOrigins").Get<string[]>()
                ?? Array.Empty<string>();

            policy.WithOrigins(allowedOrigins)
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
        }
    });
});

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();



app.Use(async (context, next) =>
{
    // var authHeader = context.Request.Headers["Authorization"].ToString();
    // if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer "))
    // {
    //     var token = authHeader.Substring("Bearer ".Length).Trim();
    //     var handler = new JwtSecurityTokenHandler();
        
    //     if (handler.CanReadToken(token))
    //     {
    //         var jwtToken = handler.ReadJwtToken(token);
    //         var emailClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == "email")?.Value;
            
    //         // Логируем "сырой" email из токена
    //         Console.WriteLine($"[RAW TOKEN] Request: {context.TraceIdentifier} | Email: {emailClaim}");
    //     }
    // }
    await next();
});

//TODO: participant token expiration handling

//app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseExceptionHandler();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Only redirect to HTTPS in production
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors("AllowOrigins");

app.UseAuthentication();
app.UseMiddleware<CurrentUserMiddleware>();
app.UseMiddleware<ApiVisitLoggingMiddleware>();
app.UseAuthorization();

app.MapControllers();

app.Run();
}
catch (Exception ex)
{
    Serilog.Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Serilog.Log.CloseAndFlush();
}



