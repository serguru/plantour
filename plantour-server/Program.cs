using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
//using plantour_server.Authorization;
using plantour_server.Models;
using plantour_server.DbModels;
using plantour_server.Services;
using PlantourApi.Authorization;
using PlantourApi.Models;
using System.Text;
using PlantourApi.Middleware;
using QuestPDF.Infrastructure;

QuestPDF.Settings.License = LicenseType.Community;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddHttpContextAccessor();

// Configure Temporary User settings
var tempUserSettings = builder.Configuration.GetSection("TemporaryUserSettings");
builder.Services.Configure<TemporaryUserSettings>(tempUserSettings);

builder.Services.Configure<TemporaryUserSettings>(builder.Configuration.GetSection("TemporaryUserSettings"));
// Configure JWT settings
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
builder.Services.Configure<JwtSettings>(jwtSettings);

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
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidIssuer = jwtConfig.Issuer,
        ValidateAudience = false,
        ValidAudience = jwtConfig.Audience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
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

builder.Services.AddScoped<ITemporaryUserService, TemporaryUserService>();


// Register repositories
builder.Services.AddScoped<plantour_server.Repositories.PackRepository>();
builder.Services.AddScoped<plantour_server.Repositories.ThingRepository>();
builder.Services.AddScoped<plantour_server.Repositories.ThingCategoryRepository>();
builder.Services.AddScoped<plantour_server.Repositories.TripRepository>();
builder.Services.AddScoped<plantour_server.Repositories.TripUserRepository>();
builder.Services.AddScoped<plantour_server.Repositories.TripThingRepository>();
builder.Services.AddScoped<plantour_server.Repositories.TripPackRepository>();
builder.Services.AddScoped<plantour_server.Repositories.LookupsRepository>();
builder.Services.AddScoped<plantour_server.Repositories.AdminsParticipantRepository>();
builder.Services.AddScoped<plantour_server.Repositories.UsersRepository>();
builder.Services.AddScoped<plantour_server.Repositories.DicTripRepository>();
builder.Services.AddScoped<plantour_server.Repositories.TripSharedRepository>();
builder.Services.AddScoped<plantour_server.Repositories.TemplateRepository>();
builder.Services.AddScoped<plantour_server.Repositories.TripCommentRepository>();

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

app.UseMiddleware<CurrentUserMiddleware>();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();



