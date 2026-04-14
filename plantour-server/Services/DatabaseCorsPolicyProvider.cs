using Microsoft.AspNetCore.Cors.Infrastructure;
using PlantourApi.Middleware;

namespace plantour_server.Services;

public sealed class DatabaseCorsPolicyProvider(
    IServiceScopeFactory serviceScopeFactory,
    IWebHostEnvironment environment) : ICorsPolicyProvider
{
    private const string AllowOriginsPolicyName = "AllowOrigins";

    private readonly IServiceScopeFactory _serviceScopeFactory = serviceScopeFactory;
    private readonly IWebHostEnvironment _environment = environment;

    public async Task<CorsPolicy?> GetPolicyAsync(HttpContext context, string? policyName)
    {
        if (!string.Equals(policyName, AllowOriginsPolicyName, StringComparison.Ordinal))
        {
            return null;
        }

        if (_environment.IsDevelopment())
        {
            return new CorsPolicyBuilder()
                .AllowAnyOrigin()
                .AllowAnyMethod()
                .AllowAnyHeader()
                .Build();
        }

        using var scope = _serviceScopeFactory.CreateScope();
        var serverSettingsService = scope.ServiceProvider.GetRequiredService<ServerSettingsService>();
        var allowedOrigins = await serverSettingsService.GetCorsAllowedOriginsAsync();

        if (allowedOrigins.Length == 0)
        {
            throw new CustomException("No origins allowed in a CORS policy");
        }

        return new CorsPolicyBuilder()
            .WithOrigins(allowedOrigins)
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials()
            .Build();
    }
}