using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Plantour.Infrastructure.Exceptions;
using Plantour.Models;
using Plantour.Services;
using System.Text;
using System.IdentityModel.Tokens.Jwt;

namespace Plantour;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        var connectionString = builder.Configuration["PlantourDb"];

        builder.Services.AddDbContext<PlantourContext>(options =>
            options.UseNpgsql(connectionString));

        // Clerk configuration
        var clerkApiUrl = builder.Configuration["Clerk:ApiUrl"];
        var clerkApiKey = builder.Configuration["Clerk:ApiKey"];

        var plantourJwtSecret = builder.Configuration["PLANTOUR_JWT_SECRET"];

        if (string.IsNullOrEmpty(clerkApiKey))
        {
            throw new Exception("Clerk configuration is missing. Please add Clerk:ApiKey to appsettings or environment variables.");
        }
        if (string.IsNullOrEmpty(plantourJwtSecret))
        {
            throw new Exception("Plantour configuration is missing. Please add PLANTOUR_JWT_SECRET to appsettings or environment variables.");
        }

        // register ClerkAuthService via typed HttpClient
        builder.Services.AddHttpClient<IClerkAuthService, ClerkAuthService>(client =>
        {
            client.BaseAddress = new Uri(clerkApiUrl);
        });

        // register IHttpContextAccessor for PlantourAuthService to resolve CurrentUser
        builder.Services.AddHttpContextAccessor();

        // Register PlantourAuthService
        builder.Services.AddScoped<IPlantourAuthService, PlantourAuthService>();

        // Configure Authentication
        builder.Services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.RequireHttpsMetadata = false;

            // We do not set issuer signing key here — we validate admin tokens explicitly against Clerk in OnTokenValidated.
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = false // we will validate via Clerk admin verify endpoint
            };

            options.Events = new JwtBearerEvents
            {
                OnMessageReceived = ctx =>
                {
                    var authHeader = ctx.Request.Headers["Authorization"].FirstOrDefault();
                    var incomingToken = authHeader?.Split(' ').Last();

                    if (string.IsNullOrEmpty(incomingToken))
                        return Task.CompletedTask;

                    var handler = new JwtSecurityTokenHandler();
                    JwtSecurityToken? jwt = null;
                    try
                    {
                        jwt = handler.ReadJwtToken(incomingToken);
                    }
                    catch
                    {
                        // Not a JWT we can parse -> proceed, validation will handle it
                        return Task.CompletedTask;
                    }

                    var isPlantourParticipant = jwt.Claims.Any(c => c.Type == "plantour_participant");
                    if (!isPlantourParticipant)
                        return Task.CompletedTask;

                    // Validate Plantour token (signed with PLANTOUR_JWT_SECRET)
                    var plantourKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(plantourJwtSecret!));
                    var validationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = false,
                        ValidateAudience = false,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = plantourKey
                    };

                    try
                    {
                        var principal = handler.ValidateToken(incomingToken, validationParameters, out var validatedToken);

                        var adminTokenClaim = principal.Claims.FirstOrDefault(c => c.Type == "admin_token")?.Value;
                        var tripTravelerIdClaim = principal.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Sub)?.Value;

                        if (!string.IsNullOrEmpty(tripTravelerIdClaim) && Guid.TryParse(tripTravelerIdClaim, out var ttId))
                        {
                            ctx.HttpContext.Items["Plantour.TripTravelerId"] = ttId;
                        }

                        if (!string.IsNullOrEmpty(adminTokenClaim))
                        {
                            // Swap token so the normal pipeline will validate the admin token (Clerk)
                            ctx.Token = adminTokenClaim;
                        }
                        else
                        {
                            // No admin token -> we cannot authenticate as admin
                            ctx.Token = null;
                        }
                    }
                    catch
                    {
                        ctx.Token = null;
                    }

                    return Task.CompletedTask;
                },
                OnTokenValidated = async ctx =>
                {
                    // Try to obtain raw token from the validated SecurityToken (if available)
                    string? token = null;
                    if (ctx.SecurityToken is JwtSecurityToken jt)
                    {
                        token = jt.RawData;
                    }

                    // Fallback: read Authorization header (Bearer ...)
                    if (string.IsNullOrEmpty(token))
                    {
                        var authHeader = ctx.Request.Headers["Authorization"].FirstOrDefault();
                        if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                        {
                            token = authHeader.Substring("Bearer ".Length).Trim();
                        }
                    }

                    if (string.IsNullOrEmpty(token))
                    {
                        ctx.Fail("No token present");
                        return;
                    }

                    // Resolve IClerkAuthService from DI and validate token via Clerk
                    var clerk = ctx.HttpContext.RequestServices.GetService(typeof(IClerkAuthService)) as IClerkAuthService;
                    if (clerk == null)
                    {
                        ctx.Fail("Clerk service unavailable");
                        return;
                    }

                    var valid = await clerk.ValidateTokenAsync(token);
                    if (!valid)
                    {
                        ctx.Fail("Invalid Clerk token");
                    }
                }
            };
        });

        // Add Authorization
        builder.Services.AddAuthorization(options =>
        {
            options.AddPolicy("RequireAdminRole", policy =>
            {
                policy.RequireClaim("role", "admin");
            });
        });

        // Add controllers and other services
        builder.Services.AddControllers();

        var allowedOrigins = builder.Configuration["ALLOWED_ORIGINS"]?
            .Split(';', StringSplitOptions.RemoveEmptyEntries) ?? Array.Empty<string>();

        builder.Services.AddCors(options =>
        {
            options.AddPolicy("DefaultCorsPolicy", policy =>
            {
                if (allowedOrigins.Length > 0)
                {
                    policy.WithOrigins(allowedOrigins)
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials();
                }
                else
                {
                    policy.AllowAnyOrigin()
                          .AllowAnyHeader()
                          .AllowAnyMethod();
                }
            });
        });

        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();

        // Repositories DI (kept unchanged)
        builder.Services.AddScoped(typeof(Plantour.Repositories.Interfaces.IRepository<,>), typeof(Plantour.Repositories.GenericRepository<,>));
        builder.Services.AddScoped<Plantour.Repositories.Interfaces.ICommunicationTypeRepository, Plantour.Repositories.CommunicationTypeRepository>();
        builder.Services.AddScoped<Plantour.Repositories.Interfaces.ICurrencyRepository, Plantour.Repositories.CurrencyRepository>();
        builder.Services.AddScoped<Plantour.Repositories.Interfaces.IInvitationRepository, Plantour.Repositories.InvitationRepository>();
        builder.Services.AddScoped<Plantour.Repositories.Interfaces.IPackingStatusRepository, Plantour.Repositories.PackingStatusRepository>();
        builder.Services.AddScoped<Plantour.Repositories.Interfaces.ITravelerRepository, Plantour.Repositories.TravelerRepository>();
        builder.Services.AddScoped<Plantour.Repositories.Interfaces.ITravelerPackageRepository, Plantour.Repositories.TravelerPackageRepository>();
        builder.Services.AddScoped<Plantour.Repositories.Interfaces.ITravelerPackageCategoryRepository, Plantour.Repositories.TravelerPackageCategoryRepository>();
        builder.Services.AddScoped<Plantour.Repositories.Interfaces.ITravelerThingRepository, Plantour.Repositories.TravelerThingRepository>();
        builder.Services.AddScoped<Plantour.Repositories.Interfaces.ITravelerThingCategoryRepository, Plantour.Repositories.TravelerThingCategoryRepository>();
        builder.Services.AddScoped<Plantour.Repositories.Interfaces.ITripRepository, Plantour.Repositories.TripRepository>();
        builder.Services.AddScoped<Plantour.Repositories.Interfaces.ITripStatusRepository, Plantour.Repositories.TripStatusRepository>();
        builder.Services.AddScoped<Plantour.Repositories.Interfaces.ITripTravelerRepository, Plantour.Repositories.TripTravelerRepository>();
        builder.Services.AddScoped<Plantour.Repositories.Interfaces.ITripTravelerThingRepository, Plantour.Repositories.TripTravelerThingRepository>();
        builder.Services.AddScoped<Plantour.Repositories.Interfaces.IUnitRepository, Plantour.Repositories.UnitRepository>();
        builder.Services.AddScoped<Plantour.Repositories.Interfaces.IUnitCategoryRepository, Plantour.Repositories.UnitCategoryRepository>();

        builder.Services.AddScoped<ITripService, TripService>();

        // Register CommunicationService for external communications (invitations, emails, etc.)
        builder.Services.AddScoped<ICommunicationService, CommunicationService>();

        var app = builder.Build();

        app.UseCors("DefaultCorsPolicy");

        if (app.Environment.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseCustomExceptionHandler();

        app.UseHttpsRedirection();

        app.UseAuthentication();
        app.UseAuthorization();

        app.MapControllers();

        app.Run();
    }
}