using plantour_maintenance_server.Middleware;
using plantour_maintenance_server.Models;

namespace plantour_maintenance_server.Services;

public class CurrentSuperuserAccessor(IHttpContextAccessor httpContextAccessor)
{
    private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;

    public AuthenticatedSuperuser GetRequiredCurrentUser()
    {
        var principal = _httpContextAccessor.HttpContext?.User;
        if (principal?.Identity?.IsAuthenticated != true)
        {
            throw new UnauthorizedException("Sign-in required.", "WRONG_TOKEN");
        }

        var idValue = principal.FindFirst(MaintenanceClaims.Subject)?.Value;
        if (!Guid.TryParse(idValue, out var id))
        {
            throw new UnauthorizedException("User id claim is missing.", "WRONG_TOKEN");
        }

        var email = principal.FindFirst(MaintenanceClaims.Email)?.Value;
        var name = principal.FindFirst(MaintenanceClaims.Name)?.Value;

        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(name))
        {
            throw new UnauthorizedException("Required user claims are missing.", "WRONG_TOKEN");
        }

        return new AuthenticatedSuperuser
        {
            Id = id,
            Email = email,
            Name = name
        };
    }
}