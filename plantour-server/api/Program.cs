namespace Plantour;

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

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        var connectionString = builder.Configuration["PlantourDb"];

        builder.Services.AddDbContext<PlantourContext>(options =>
            options.UseNpgsql(connectionString));

        var supabaseUrl = builder.Configuration["SUPABASE_URL"];
        var supabaseAnonKey = builder.Configuration["SUPABASE_ANON_KEY"];
        var supabaseJwtSecret = builder.Configuration["SUPABASE_JWT_SECRET"];
        var supabaseServiceRoleKey = builder.Configuration["SUPABASE_SERVICE_ROLE_KEY"];
        var plantourJwtSecret = builder.Configuration["PLANTOUR_JWT_SECRET"];

        if (string.IsNullOrEmpty(supabaseUrl))
        {
            throw new Exception("Supabase configuration is missing. Please add SUPABASE_URL to appsettings or environment variables.");
        }
        if (string.IsNullOrEmpty(supabaseAnonKey))
        {
            throw new Exception("Supabase configuration is missing. Please add SUPABASE_ANON_KEY to appsettings or environment variables.");
        }
        if (string.IsNullOrEmpty(supabaseJwtSecret))
        {
            throw new Exception("Supabase configuration is missing. Please add SUPABASE_JWT_SECRET to appsettings or environment variables.");
        }
        if (string.IsNullOrEmpty(supabaseServiceRoleKey))
        {
            throw new Exception("Supabase configuration is missing. Please add SUPABASE_SERVICE_ROLE_KEY to appsettings or environment variables.");
        }
        if (string.IsNullOrEmpty(plantourJwtSecret))
        {
            throw new Exception("Plantour configuration is missing. Please add PLANTOUR_JWT_SECRET to appsettings or environment variables.");
        }

        builder.Services.AddSingleton<ISupabaseAuthService>(sp =>
            new SupabaseAuthService(supabaseUrl!, supabaseAnonKey!, supabaseServiceRoleKey!)
        );

        // register IHttpContextAccessor for PlantourAuthService to resolve CurrentUser
        builder.Services.AddHttpContextAccessor();

        // Register PlantourAuthService
        builder.Services.AddScoped<IPlantourAuthService, PlantourAuthService>();

        // Configure Authentication: validate Supabase JWT locally
        builder.Services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.RequireHttpsMetadata = false;

            // Basic validation using Supabase JWT secret (HS256)
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(supabaseJwtSecret!)),
                RoleClaimType = "role"
            };

            // Intercept incoming token: if it's a Plantour participant token (signed with PLANTOUR_JWT_SECRET)
            // and contains embedded admin_token claim, replace the token with that admin_token so the normal Supabase validation runs.
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
                        // Not a JWT we can parse -> proceed, standard validation will handle it
                        return Task.CompletedTask;
                    }

                    var isPlantourParticipant = jwt.Claims.Any(c => c.Type == "plantour_participant");
                    if (!isPlantourParticipant)
                        return Task.CompletedTask;

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
                            // Swap token so rest of pipeline validates using Supabase JWT secret
                            ctx.Token = adminTokenClaim;
                        }
                        else
                        {
                            // If there is no admin_token embedded authentication will not succeed.
                            ctx.Token = null;
                        }
                    }
                    catch
                    {
                        ctx.Token = null;
                    }

                    return Task.CompletedTask;
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

        // Add services to the container.
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

        // Repositories DI
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