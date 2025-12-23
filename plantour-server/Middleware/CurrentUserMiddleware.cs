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
                var email = jwtToken.Claims.FirstOrDefault(c => c.Type == PlantourClaims.Email)?.Value;

                if (userId != Guid.Empty && !string.IsNullOrEmpty(email))
                {
                    currentUser.UserId = userId;
                    currentUser.Email = email;
                    currentUser.FirstName = jwtToken.Claims.FirstOrDefault(c => c.Type == PlantourClaims.FirstName)?.Value;
                    currentUser.LastName = jwtToken.Claims.FirstOrDefault(c => c.Type == PlantourClaims.LastName)?.Value;

                    var roleClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == PlantourClaims.Role)?.Value;

                    if (roleClaim == PlantourRoles.Admin || roleClaim == PlantourRoles.Participant)
                    {
                        // Determine role based on PlantourRoles constants
                        if (roleClaim == PlantourRoles.Admin)
                        {
                            currentUser.Role = UserRole.Admin;
                            currentUser.AdminId = userId;
                        }
                        else
                        {
                            var adminIdClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == PlantourClaims.AdminId)?.Value;

                            if (Guid.TryParse(adminIdClaim, out var adminId))
                            {
                                if (adminId != Guid.Empty)
                                {
                                    currentUser.AdminId = adminId;
                                    currentUser.Role = UserRole.Participant;
                                }
                            }
                        }
                    }
                }
            }
        }

        context.Items["CurrentUser"] = currentUser;
        await _next(context);
    }
}