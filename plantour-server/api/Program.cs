using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using pack_api.Infrastructure.Exceptions;
using pack_api.Infrastructure.Supabase;

namespace pack_api
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Configure Supabase options from configuration or environment variables
            builder.Services.Configure<SupabaseOptions>(builder.Configuration.GetSection("Supabase"));
            var supOpts = builder.Configuration.GetSection("Supabase").Get<SupabaseOptions>() ?? new SupabaseOptions
            {
                Url = builder.Configuration["SUPABASE_URL"] ?? string.Empty,
                ApiKey = builder.Configuration["SUPABASE_API_KEY"] ?? string.Empty,
                AuthUrl = builder.Configuration["SUPABASE_AUTH_URL"] ?? string.Empty,
                OpenIdConfigUrl = builder.Configuration["SUPABASE_OPENID_CONFIG_URL"] ?? string.Empty,
                Audience = builder.Configuration["SUPABASE_AUDIENCE"] ?? string.Empty
            };

            // Add services to the container.
            builder.Services.AddControllers();

            // Register Supabase HttpClient with safe default headers
            builder.Services.AddHttpClient<ISupabaseAuthService, SupabaseAuthService>(client =>
            {
                client.BaseAddress = new Uri(supOpts.Url);
                // Use the anon/public key for client operations. Service role key must never be embedded in client bundles.
                if (!string.IsNullOrWhiteSpace(supOpts.ApiKey))
                    client.DefaultRequestHeaders.Add("apikey", supOpts.ApiKey);
            });

            // JWT Authentication using Supabase JWKS/OpenID metadata (if available)
            JwtSecurityTokenHandler.DefaultMapInboundClaims = false;

            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.RequireHttpsMetadata = true;
                    // Prefer OpenID metadata if provided
                    if (!string.IsNullOrWhiteSpace(supOpts.OpenIdConfigUrl))
                    {
                        options.MetadataAddress = supOpts.OpenIdConfigUrl;
                    }
                    else if (!string.IsNullOrWhiteSpace(supOpts.AuthUrl))
                    {
                        // Common Supabase setup: use auth/v1 as auth base, try openid configuration
                        options.MetadataAddress = supOpts.AuthUrl.TrimEnd('/') + "/.well-known/openid-configuration";
                    }

                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = !string.IsNullOrWhiteSpace(supOpts.AuthUrl),
                        ValidIssuer = !string.IsNullOrWhiteSpace(supOpts.AuthUrl) ? supOpts.AuthUrl.TrimEnd('/') : null,
                        ValidateAudience = !string.IsNullOrWhiteSpace(supOpts.Audience),
                        ValidAudience = !string.IsNullOrWhiteSpace(supOpts.Audience) ? supOpts.Audience : null,
                        ValidateLifetime = true
                    };

                    // Optional: map claims, log events
                    options.Events = new JwtBearerEvents
                    {
                        OnAuthenticationFailed = ctx =>
                        {
                            var logger = ctx.HttpContext.RequestServices.GetRequiredService<ILoggerFactory>().CreateLogger("JwtAuth");
                            logger.LogWarning(ctx.Exception, "JWT authentication failed.");
                            return Task.CompletedTask;
                        }
                    };
                });

            // Default authorization policy: require authenticated users by attribute (you can change to global)
            builder.Services.AddAuthorization();

            // CORS: read allowed origins from env/config key "ALLOWED_ORIGINS" (semicolon-separated).
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
            builder.Services.AddOpenApi();

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
            }

            // Ensure CORS runs before other middleware that might handle requests
            app.UseCors("DefaultCorsPolicy");

            // Centralized exception handling middleware (must come early)
            app.UseCustomExceptionHandler();

            // Authentication and Authorization
            app.UseAuthentication();
            app.UseAuthorization();

            app.UseHttpsRedirection();

            app.MapControllers();

            app.Run();
        }
    }
}