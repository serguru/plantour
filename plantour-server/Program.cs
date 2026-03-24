using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Caching.Hybrid;
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
using Microsoft.AspNetCore.HttpOverrides;
using plantour_server.Utils.Logging;
using plantour_server.Utils;
using TickerQ.DependencyInjection;
using TickerQ.Dashboard.DependencyInjection;
using TickerQ.EntityFrameworkCore.DependencyInjection;
using plantour_server.Services.TickerQ;
using Npgsql;
using System.Threading.RateLimiting;

QuestPDF.Settings.License = LicenseType.Community;

// This switch prevents Npgsql from throwing when a DateTime with Kind=Utc is written to such columns.
// It looks like this row is necessary for TickerQ to write timestamp fields
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

static string NormalizeAspNetEnvironmentName(string? raw)
{
    if (string.IsNullOrWhiteSpace(raw))
    {
        return Environments.Production;
    }

    return raw.Trim().ToLowerInvariant() switch
    {
        "dev" => Environments.Development,
        "development" => Environments.Development,
        "qa" => "QA",
        "pred-prod" => "Pred-Prod",
        "predprod" => "Pred-Prod",
        "preprod" => "Pred-Prod",
        "production" => Environments.Production,
        "prod" => Environments.Production,
        _ => raw.Trim()
    };
}

static string GetRateLimitPartitionKey(HttpContext context)
{
    var cfConnectingIp = context.Request.Headers["CF-Connecting-IP"].FirstOrDefault();
    if (!string.IsNullOrWhiteSpace(cfConnectingIp))
    {
        return cfConnectingIp;
    }

    var forwardedFor = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
    if (!string.IsNullOrWhiteSpace(forwardedFor))
    {
        return forwardedFor.Split(',')[0].Trim();
    }

    return context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
}

var rawEnvironmentName =
    Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")
    ?? Environment.GetEnvironmentVariable("DOTNET_ENVIRONMENT");

var aspNetUrls = Environment.GetEnvironmentVariable("ASPNETCORE_URLS");
var renderPort = Environment.GetEnvironmentVariable("PORT");

var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
    EnvironmentName = NormalizeAspNetEnvironmentName(rawEnvironmentName)
});

var env = builder.Environment;

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders =
        ForwardedHeaders.XForwardedFor |
        ForwardedHeaders.XForwardedProto;

    // Trust all proxies (required in container/cloud environments)
    options.RequireHeaderSymmetry = false;
});

if (string.IsNullOrWhiteSpace(aspNetUrls) && !string.IsNullOrWhiteSpace(renderPort))
{
    builder.WebHost.UseUrls($"http://0.0.0.0:{renderPort}");
}

// Configure Serilog with explicit column mappings for PostgreSQL
var columnOptions = new Dictionary<string, ColumnWriterBase>
{
    { "message_template", new RenderedMessageColumnWriter(NpgsqlDbType.Text) },
    { "level", new LevelColumnWriter(true, NpgsqlDbType.Varchar) },
    { "time_stamp", new UnspecifiedUtcTimestampColumnWriter() },
    { "exception", new ExceptionColumnWriter(NpgsqlDbType.Text) },
    { "log_event", new LogEventSerializedColumnWriter(NpgsqlDbType.Text) },
    { "properties", new PropertiesColumnWriter(NpgsqlDbType.Jsonb) },
    { "event_type", new SinglePropertyColumnWriter("event_type", PropertyWriteMethod.Raw, NpgsqlDbType.Varchar) },
    { "subtype", new SinglePropertyColumnWriter("subtype", PropertyWriteMethod.Raw, NpgsqlDbType.Varchar) }
};

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Read MinimumLevel from appsettings
var minimumLevelSection = builder.Configuration.GetSection("Serilog:MinimumLevel");
var minimumLevelString = minimumLevelSection["Default"]
    ?? minimumLevelSection.Value
    ?? "Information";

if (!Enum.TryParse<LogEventLevel>(minimumLevelString, true, out var minimumLevel))
{
    minimumLevel = LogEventLevel.Information;
}

var loggerConfiguration = new LoggerConfiguration()
    .MinimumLevel.Is(minimumLevel)
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
    .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}");

foreach (var overrideSection in minimumLevelSection.GetSection("Override").GetChildren())
{
    if (Enum.TryParse<LogEventLevel>(overrideSection.Value, true, out var overrideLevel))
    {
        loggerConfiguration.MinimumLevel.Override(overrideSection.Key, overrideLevel);
    }
}

Serilog.Log.Logger = loggerConfiguration.CreateLogger();

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
    builder.Services.AddHybridCache(options =>
    {
        options.MaximumPayloadBytes = 1024 * 1024;
        options.MaximumKeyLength = 1024;
        options.DefaultEntryOptions = new HybridCacheEntryOptions
        {
            Expiration = TimeSpan.FromMinutes(10),
            LocalCacheExpiration = TimeSpan.FromMinutes(5)
        };
    });


    // Configure JWT settings
    var jwtSettings = builder.Configuration.GetSection("JwtSettings");
    builder.Services.Configure<JwtSettings>(jwtSettings);

    // Configure Social auth settings
    builder.Services.Configure<SocialAuthSettings>(builder.Configuration.GetSection("SocialAuthSettings"));

    // Configure Turnstile settings
    builder.Services.Configure<TurnstileSettings>(builder.Configuration.GetSection("Turnstile"));

    // Configure Brevo settings
    builder.Services.Configure<BrevoSettings>(builder.Configuration.GetSection("BrevoSettings"));

    // Configure Gemini settings
    builder.Services.Configure<GeminiSettings>(builder.Configuration.GetSection("GeminiSettings"));

    var jwtConfig = jwtSettings.Get<JwtSettings>();
    var key = Encoding.UTF8.GetBytes(jwtConfig!.SecretKey);

    var dataSourceBuilder = new NpgsqlDataSourceBuilder(connectionString);

    // Set the timezone to UTC programmatically
    dataSourceBuilder.ConnectionStringBuilder.Timezone = "UTC";

    // 2. Build the DataSource
    var dataSource = dataSourceBuilder.Build();

    // Configure PostgreSQL connection
    // builder.Services.AddDbContext<PlantourContext>(options =>
    //     options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

    builder.Services.AddDbContext<PlantourContext>(options =>
        options.UseNpgsql(dataSource));

    builder.Services.AddTickerQ(options =>
    {
        options.AddOperationalStore(efOptions =>
        {
            efOptions.UseTickerQDbContext<TickerQOperationalDbContext>(dbOptions =>
            {
                dbOptions.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
            }, schema: "plantour");
        });

        options.AddDashboard(dashboardOptions =>
        {
            dashboardOptions.SetBasePath("/tickerq/dashboard");

            if (!env.IsDevelopment())
            {
                var dashboardUsername = builder.Configuration["TickerQ:DashboardAuth:Username"];
                var dashboardPassword = builder.Configuration["TickerQ:DashboardAuth:Password"];

                if (string.IsNullOrWhiteSpace(dashboardUsername) || string.IsNullOrWhiteSpace(dashboardPassword))
                {
                    throw new InvalidOperationException(
                        "TickerQ dashboard auth is required outside Development. Set TickerQ:DashboardAuth:Username and TickerQ:DashboardAuth:Password.");
                }

                dashboardOptions.WithBasicAuth(dashboardUsername, dashboardPassword);
            }
        });
    });


    builder.Services.AddSingleton<TickerQRecurringTasksScheduler>();

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
        options.MapInboundClaims = false; // Prevent default claim type mapping
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

        // options.AddPolicy("Public", policy =>
        //     policy.Requirements.Add(new UserRoleRequirement(null, UserRole.Participant, UserRole.Admin)));
    });

    // Register authorization handlers
    builder.Services.AddSingleton<IAuthorizationHandler, UserRoleHandler>();

    // Register AutoMapper
    builder.Services.AddAutoMapper(typeof(Program).Assembly);

    builder.Services.AddRateLimiter(options =>
    {
        options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
        options.OnRejected = async (context, cancellationToken) =>
        {
            await ErrorResponse.WriteErrorResponse(
                context.HttpContext,
                StatusCodes.Status429TooManyRequests,
                "TOO_MANY_REQUESTS",
                "Too many requests. Please try again later.");
        };

        options.AddPolicy("admin-signin-email", httpContext =>
            RateLimitPartition.GetFixedWindowLimiter(
                partitionKey: GetRateLimitPartitionKey(httpContext),
                factory: _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = 5,
                    Window = TimeSpan.FromMinutes(10),
                    QueueLimit = 0,
                    QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                    AutoReplenishment = true
                }));

        options.AddPolicy("admin-signin-token", httpContext =>
            RateLimitPartition.GetFixedWindowLimiter(
                partitionKey: GetRateLimitPartitionKey(httpContext),
                factory: _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = 12,
                    Window = TimeSpan.FromMinutes(10),
                    QueueLimit = 0,
                    QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                    AutoReplenishment = true
                }));

        options.AddPolicy("admin-social-signin", httpContext =>
            RateLimitPartition.GetFixedWindowLimiter(
                partitionKey: GetRateLimitPartitionKey(httpContext),
                factory: _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = 8,
                    Window = TimeSpan.FromMinutes(10),
                    QueueLimit = 0,
                    QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                    AutoReplenishment = true
                }));

        options.AddPolicy("participant-signin", httpContext =>
            RateLimitPartition.GetFixedWindowLimiter(
                partitionKey: GetRateLimitPartitionKey(httpContext),
                factory: _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = 10,
                    Window = TimeSpan.FromMinutes(10),
                    QueueLimit = 0,
                    QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                    AutoReplenishment = true
                }));

        options.AddPolicy("temporary-user-create", httpContext =>
            RateLimitPartition.GetFixedWindowLimiter(
                partitionKey: GetRateLimitPartitionKey(httpContext),
                factory: _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = 3,
                    Window = TimeSpan.FromHours(1),
                    QueueLimit = 0,
                    QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                    AutoReplenishment = true
                }));

        options.AddPolicy("contact-submit", httpContext =>
            RateLimitPartition.GetFixedWindowLimiter(
                partitionKey: GetRateLimitPartitionKey(httpContext),
                factory: _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = 5,
                    Window = TimeSpan.FromMinutes(10),
                    QueueLimit = 0,
                    QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                    AutoReplenishment = true
                }));

        options.AddPolicy("refresh-token", httpContext =>
            RateLimitPartition.GetFixedWindowLimiter(
                partitionKey: GetRateLimitPartitionKey(httpContext),
                factory: _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = 30,
                    Window = TimeSpan.FromMinutes(5),
                    QueueLimit = 0,
                    QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                    AutoReplenishment = true
                }));

        options.AddPolicy("is-user-temporary", httpContext =>
            RateLimitPartition.GetFixedWindowLimiter(
                partitionKey: GetRateLimitPartitionKey(httpContext),
                factory: _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = 20,
                    Window = TimeSpan.FromMinutes(5),
                    QueueLimit = 0,
                    QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                    AutoReplenishment = true
                }));
    });

    // Register services
    builder.Services.AddScoped<IUsersService, UsersService>();
    builder.Services.AddScoped<IPackageService, PackService>();
    builder.Services.AddScoped<IThingService, ThingService>();
    builder.Services.AddScoped<ITodoService, TodoService>();
    builder.Services.AddScoped<ITripService, TripService>();
    builder.Services.AddScoped<ITripUserService, TripUserService>();
    builder.Services.AddScoped<ITripThingService, TripThingService>();
    builder.Services.AddScoped<ITripTodoService, TripTodoService>();
    builder.Services.AddScoped<ITripPackageService, TripPackageService>();
    builder.Services.AddScoped<ILookupsService, LookupsService>();
    builder.Services.AddScoped<IAdminsParticipantService, AdminsParticipantService>();
    builder.Services.AddScoped<ITripSharedService, TripSharedService>();
    builder.Services.AddScoped<ITripSharedTodoService, TripSharedTodoService>();
    builder.Services.AddScoped<ICheckAccessService, CheckAccessService>();
    builder.Services.AddScoped<ITemplateService, TemplateService>();
    builder.Services.AddScoped<ITripCommentService, TripCommentService>();
    builder.Services.AddScoped<IDocumentsService, DocumentsService>();
    builder.Services.AddScoped<IEmailService, EmailService>();
    builder.Services.AddScoped<IInvitationService, InvitationService>();
    builder.Services.AddScoped<IPublicTemplatesService, PublicTemplatesService>();
    builder.Services.AddScoped<ITemporaryUserService, TemporaryUserService>();
    builder.Services.AddScoped<ITokenService, TokenService>();
    builder.Services.AddScoped<ISignInEmailService, SignInEmailService>();
    builder.Services.AddScoped<ISharedAssignmentNotificationService, SharedAssignmentNotificationService>();
    builder.Services.AddScoped<IContactSubmissionService, ContactSubmissionService>();
    builder.Services.AddScoped<IDashboardService, DashboardService>();
    builder.Services.AddScoped<IPaddleService, PaddleService>();
    builder.Services.AddScoped<IAccessRulesService, AccessRulesService>();
    builder.Services.AddScoped<ISchedulerService, SchedulerService>();
    builder.Services.AddScoped<AccessCodeGenerator>();
    builder.Services.AddHttpClient<IBotProtectionService, BotProtectionService>();

    builder.Services.AddHttpClient<IBrevoEmailClient, BrevoEmailClient>();
    builder.Services.AddHttpClient<IAiService, AiService>();

    // Register repositories
    builder.Services.AddScoped<plantour_server.Repositories.PackRepository>();
    builder.Services.AddScoped<plantour_server.Repositories.ThingRepository>();
    builder.Services.AddScoped<plantour_server.Repositories.TodoRepository>();
    builder.Services.AddScoped<plantour_server.Repositories.ThingCategoryRepository>();
    builder.Services.AddScoped<plantour_server.Repositories.TodoCategoryRepository>();
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
    builder.Services.AddScoped<plantour_server.Repositories.TripTodoRepository>();
    builder.Services.AddScoped<plantour_server.Repositories.TripPackRepository>();
    builder.Services.AddScoped<plantour_server.Repositories.LookupsRepository>();
    builder.Services.AddScoped<plantour_server.Repositories.AdminsParticipantRepository>();
    builder.Services.AddScoped<plantour_server.Repositories.UsersRepository>();
    builder.Services.AddScoped<plantour_server.Repositories.InvitationsRepository>();
    builder.Services.AddScoped<plantour_server.Repositories.DicTripRepository>();
    builder.Services.AddScoped<plantour_server.Repositories.TripSharedRepository>();
    builder.Services.AddScoped<plantour_server.Repositories.TripSharedTodoRepository>();
    builder.Services.AddScoped<plantour_server.Repositories.TemplateRepository>();
    builder.Services.AddScoped<plantour_server.Repositories.TripCommentRepository>();
    builder.Services.AddScoped<plantour_server.Repositories.ContactSubmissionRepository>();
    builder.Services.AddScoped<plantour_server.Repositories.LogsRepository>();
    builder.Services.AddScoped<plantour_server.Repositories.AiPromptRepository>();
    builder.Services.AddScoped<plantour_server.Repositories.AiRepository>();
    builder.Services.AddScoped<plantour_server.Repositories.SettingsRepository>();
    builder.Services.AddScoped<plantour_server.Repositories.AiPromptChecksRepository>();
    builder.Services.AddScoped<plantour_server.Repositories.RefreshTokenRepository>();
    builder.Services.AddScoped<plantour_server.Repositories.TimeTickerRepository>();
    builder.Services.AddScoped<plantour_server.Repositories.UserSettingsRepository>();

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
                // var allowedOrigins = builder.Configuration.GetSection("CorsSettings:AllowedOrigins").Get<string[]>()
                //     ?? Array.Empty<string>();

                // policy.WithOrigins(allowedOrigins)
                //       .AllowAnyMethod()
                //       .AllowAnyHeader()
                //       .AllowCredentials();
                policy.AllowAnyOrigin()
                      .AllowAnyMethod()
                      .AllowAnyHeader();
            }
        });
    });

    // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
    builder.Services.AddOpenApi();

    var app = builder.Build();

    app.UseForwardedHeaders();

    if (!app.Environment.IsProduction())
    {
        app.Use(async (context, next) =>
        {
            context.Response.Headers.Append("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");
            await next();
        });
    }

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

    app.UseRateLimiter();
    app.UseAuthentication();
    app.UseMiddleware<CurrentUserMiddleware>();
    app.UseMiddleware<ApiVisitLoggingMiddleware>();
    app.UseAuthorization();
    app.UseTickerQ();

    using var cronSyncScope = app.Services.CreateScope();
    var recurringTasksScheduler = cronSyncScope.ServiceProvider.GetRequiredService<TickerQRecurringTasksScheduler>();
    await recurringTasksScheduler.StartAsync(CancellationToken.None);

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



