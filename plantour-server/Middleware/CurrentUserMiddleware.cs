using plantour_server.Models;
using plantour_server.DbModels;
using PlantourApi.Models;
using System.IdentityModel.Tokens.Jwt;

namespace PlantourApi.Middleware;

public class CurrentUserMiddleware
{
    private readonly RequestDelegate _next;

    public CurrentUserMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var currentUser = new CurrentUser { Role = UserRole.Public };

        // Check for Authorization header
        var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
        if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer "))
        {
            var token = authHeader.Substring("Bearer ".Length).Trim();

            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadJwtToken(token);

            // Extract user information from JWT claims using PlantourClaims constants
            var userIdClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == PlantourClaims.UserId)?.Value;

            if (Guid.TryParse(userIdClaim, out var userId))
            {
                currentUser.UserId = userId;
                currentUser.Email = jwtToken.Claims.FirstOrDefault(c => c.Type == PlantourClaims.Email)?.Value;
                currentUser.FirstName = jwtToken.Claims.FirstOrDefault(c => c.Type == PlantourClaims.FirstName)?.Value;
                currentUser.LastName = jwtToken.Claims.FirstOrDefault(c => c.Type == PlantourClaims.LastName)?.Value;

                var roleClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == PlantourClaims.Role)?.Value;

                // Determine role based on PlantourRoles constants
                if (roleClaim == PlantourRoles.Admin)
                {
                    currentUser.Role = UserRole.Admin;
                }
                else
                {
                    var adminIdClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == PlantourClaims.AdminId)?.Value;
                    if (roleClaim == PlantourRoles.Participant && Guid.TryParse(adminIdClaim, out var adminId))
                    {
                        currentUser.AdminId = adminId;
                        currentUser.Role = UserRole.Participant;
                        currentUser.AccessCode = jwtToken.Claims.FirstOrDefault(c => c.Type == PlantourClaims.AccessCode)?.Value;   
                    }
                }
            }
        }

        context.Items["CurrentUser"] = currentUser;
        await _next(context);
    }
}