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

        builder.Services.AddSingleton<ISupabaseAuthService>(sp =>
            new SupabaseAuthService(supabaseUrl!, supabaseAnonKey!, supabaseServiceRoleKey!)
        );

        // Configure Authentication: validate Supabase JWT locally
        builder.Services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.RequireHttpsMetadata = false;
            //options.SaveToken = false; // we don't store tokens in server's auth properties

            // Basic validation using Supabase JWT secret (HS256)
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = false,      // set true if you want to verify issuer (supabase URL)
                ValidateAudience = false,    // set true if you want to verify audience
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(supabaseJwtSecret!)),

                // If your tokens include the role claim under a different name, set RoleClaimType appropriately:
                RoleClaimType = "role"
            };

            // Optional: If you want to inspect the incoming token before standard validation
            // options.Events = new JwtBearerEvents { OnMessageReceived = ctx => { ... } };
        });

        // Add Authorization
        builder.Services.AddAuthorization(options =>
        {
            // Example policy which requires claim "role" equals "admin"
            options.AddPolicy("RequireAdminRole", policy =>
            {
                policy.RequireClaim("role", "admin");
            });
        });


        //builder.Services.AddEndpointsApiExplorer();
        //builder.Services.AddSwaggerGen(options =>
        //{
        //    // Define the security scheme: JWT Bearer
        //    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        //    {
        //        Name = "Authorization",
        //        Type = SecuritySchemeType.Http,
        //        Scheme = "Bearer",
        //        BearerFormat = "JWT",
        //        In = ParameterLocation.Header,
        //        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token in the text input below. Example: \"Bearer 12345abcdef\""
        //    });
        //    // Other Swagger options...
        //    // Apply the security requirement globally
        //    options.AddSecurityRequirement(new OpenApiSecurityRequirement
        //    {
        //        {
        //            new OpenApiSecurityScheme
        //            {
        //                Reference = new OpenApiReference
        //                {
        //                    Type = ReferenceType.SecurityScheme,
        //                    Id = "Bearer" // Must match the name defined in AddSecurityDefinition
        //                }
        //            },
        //            new string[] {} // Required scopes (empty for basic JWT)
        //        }
        //    });


        //});

        // Add services to the container.
        builder.Services.AddControllers();

        // CORS: read allowed origins from env/config key "ALLOWED_ORIGINS" (semicolon-separated).
        // If not set, falls back to AllowAnyOrigin (useful for development).
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


        // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
        //builder.Services.AddOpenApi();

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

        // Ensure CORS runs before other middleware that might handle requests
        app.UseCors("DefaultCorsPolicy");

        // Configure the HTTP request pipeline.
        if (app.Environment.IsDevelopment())
        {
            //app.MapOpenApi();
            app.UseDeveloperExceptionPage();
            app.UseSwagger();
            app.UseSwaggerUI();
        }


        // Centralized exception handling middleware (must come early in pipeline)
        app.UseCustomExceptionHandler();

        app.UseHttpsRedirection();

        app.UseAuthentication();
        app.UseAuthorization();

        app.MapControllers();

        app.Run();
    }
}