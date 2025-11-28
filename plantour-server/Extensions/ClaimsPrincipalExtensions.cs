using System.Security.Claims;
using plantour_server.Models;

namespace plantour_server.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static Guid GetUserId(this ClaimsPrincipal principal)
    {
        var userIdClaim = principal.FindFirst(PlantourClaims.UserId)?.Value;
        return Guid.TryParse(userIdClaim, out var userId) ? userId : Guid.Empty;
    }

    public static string? GetEmail(this ClaimsPrincipal principal)
    {
        return principal.FindFirst(PlantourClaims.Email)?.Value;
    }

    public static string GetRole(this ClaimsPrincipal principal)
    {
        return principal.FindFirst(PlantourClaims.Role)?.Value ?? string.Empty;
    }

    public static bool IsAdmin(this ClaimsPrincipal principal)
    {
        return principal.GetRole() == PlantourRoles.Admin;
    }

    public static bool IsParticipant(this ClaimsPrincipal principal)
    {
        return principal.GetRole() == PlantourRoles.Participant;
    }

    public static Guid GetAdminId(this ClaimsPrincipal principal)
    {
        if (principal.IsAdmin())
        {
            return principal.GetUserId();
        }

        var adminIdClaim = principal.FindFirst(PlantourClaims.AdminId)?.Value;
        return Guid.TryParse(adminIdClaim, out var adminId) ? adminId : Guid.Empty;
    }

    public static Guid? GetParticipantId(this ClaimsPrincipal principal)
    {
        if (!principal.IsParticipant())
        {
            return null;
        }

        var participantIdClaim = principal.FindFirst(PlantourClaims.ParticipantId)?.Value;
        return Guid.TryParse(participantIdClaim, out var participantId) ? participantId : null;
    }

    public static string? GetAccessCode(this ClaimsPrincipal principal)
    {
        return principal.FindFirst(PlantourClaims.AccessCode)?.Value;
    }
}