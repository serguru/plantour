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

        // 1. Проверяем, что пользователь успешно прошел проверку токена
        if (context.User.Identity?.IsAuthenticated == true)
        {
            // 2. Достаем UserId
            var userIdStr = context.User.FindFirst(PlantourClaims.UserId)?.Value;
            if (Guid.TryParse(userIdStr, out var userId))
            {
                currentUser.UserId = userId;

                // 3. Достаем остальные данные
                currentUser.Email = context.User.FindFirst(PlantourClaims.Email)!.Value;
                currentUser.FirstName = context.User.FindFirst(PlantourClaims.FirstName)?.Value;
                currentUser.LastName = context.User.FindFirst(PlantourClaims.LastName)?.Value;

                // 4. Логика с ролями и AdminId
                var roleClaim = context.User.FindFirst(PlantourClaims.Role)?.Value;
                var adminIdStr = context.User.FindFirst(PlantourClaims.AdminId)?.Value;

                if (roleClaim == PlantourRoles.Admin)
                {
                    currentUser.Role = UserRole.Admin;
                    currentUser.AdminId = userId; // У админа AdminId совпадает с его UserId
                }
                else if (roleClaim == PlantourRoles.Participant)
                {
                    currentUser.Role = UserRole.Participant;
                    if (Guid.TryParse(adminIdStr, out var adminId))
                    {
                        currentUser.AdminId = adminId;
                    }
                }
            }
        }

        // Сохраняем результат для контроллеров
        context.Items["CurrentUser"] = currentUser;
        await _next(context);
    }

    // public async Task InvokeAsync(HttpContext context)
    // {
    //     var currentUser = new CurrentUser { Role = UserRole.Public };

    //     // Check for Authorization header
    //     var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
    //     if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer "))
    //     {
    //         var token = authHeader.Substring("Bearer ".Length).Trim();

    //         var handler = new JwtSecurityTokenHandler();
    //         var jwtToken = handler.ReadJwtToken(token);

    //         // Extract user information from JWT claims using PlantourClaims constants
    //         var userIdClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == PlantourClaims.UserId)?.Value;

    //         if (Guid.TryParse(userIdClaim, out var userId))
    //         {
    //             var email = jwtToken.Claims.FirstOrDefault(c => c.Type == PlantourClaims.Email)?.Value;

    //             if (userId != Guid.Empty && !string.IsNullOrEmpty(email))
    //             {
    //                 currentUser.UserId = userId;
    //                 currentUser.Email = email;
    //                 currentUser.FirstName = jwtToken.Claims.FirstOrDefault(c => c.Type == PlantourClaims.FirstName)?.Value;
    //                 currentUser.LastName = jwtToken.Claims.FirstOrDefault(c => c.Type == PlantourClaims.LastName)?.Value;

    //                 var roleClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == PlantourClaims.Role)?.Value;

    //                 if (roleClaim == PlantourRoles.Admin || roleClaim == PlantourRoles.Participant)
    //                 {
    //                     // Determine role based on PlantourRoles constants
    //                     if (roleClaim == PlantourRoles.Admin)
    //                     {
    //                         currentUser.Role = UserRole.Admin;
    //                         currentUser.AdminId = userId;
    //                     }
    //                     else
    //                     {
    //                         var adminIdClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == PlantourClaims.AdminId)?.Value;

    //                         if (Guid.TryParse(adminIdClaim, out var adminId))
    //                         {
    //                             if (adminId != Guid.Empty)
    //                             {
    //                                 currentUser.AdminId = adminId;
    //                                 currentUser.Role = UserRole.Participant;
    //                             }
    //                         }
    //                     }
    //                 }
    //             }
    //         }
    //     }

    //     context.Items["CurrentUser"] = currentUser;
    //     await _next(context);
    // }
}