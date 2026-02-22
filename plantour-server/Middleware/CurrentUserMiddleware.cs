using System.Collections.Generic;
using Microsoft.Extensions.DependencyInjection;
using plantour_server.Models;
using PlantourApi.Models;
using plantour_server.Repositories;
using plantour_server.Services;
using Microsoft.Extensions.Logging;
using Serilog.Context;
using System.Text.Json;
using plantour_server.Utils;

namespace PlantourApi.Middleware;

public class CurrentUserMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<CurrentUserMiddleware> _logger;

    public CurrentUserMiddleware(RequestDelegate next, ILogger<CurrentUserMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var currentUser = new CurrentUser { Role = UserRole.Public };

        // 1. Проверяем, что пользователь успешно прошел проверку токена
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var usersRepository = context.RequestServices.GetRequiredService<UsersRepository>();
            var emailConfirmationService = context.RequestServices.GetRequiredService<IEmailConfirmationService>();

            // 2. Достаем UserId
            var userIdStr = context.User.FindFirst(PlantourClaims.UserId)?.Value;
            if (Guid.TryParse(userIdStr, out var userId))
            {
                var user = await usersRepository.GetByIdWithDetailsAsync(userId);
                if (user != null)
                {
                    currentUser.UserId = user.Id;
                    currentUser.Email = user.Email;
                    currentUser.FirstName = user.FirstName;
                    currentUser.LastName = user.LastName;
                    currentUser.PasswordHash = user.PasswordHash;
                    currentUser.PasswordSalt = user.PasswordSalt;
                    currentUser.Phone = user.Phone;
                    currentUser.Notes = user.Notes;
                    currentUser.CreatedAt = user.CreatedAt;
                    currentUser.Discount = user.Discount;
                    currentUser.PlanId = user.PlanId;
                    currentUser.AccessTypeId = user.AccessTypeId;
                    currentUser.PlanName = user.Plan?.Name;
                    currentUser.AccessTypeName = user.AccessType?.Name;
                    currentUser.EmailConfirmed = await emailConfirmationService.IsEmailConfirmedAsync(user.Id);

                    _logger.LogDebug("User authenticated successfully: {UserId} ({Email})", user.Id, user.Email);
                }
                else
                {
                    currentUser.UserId = userId;
                    currentUser.Email = context.User.FindFirst(PlantourClaims.Email)?.Value ?? string.Empty;
                    currentUser.FirstName = context.User.FindFirst(PlantourClaims.FirstName)?.Value;
                    currentUser.LastName = context.User.FindFirst(PlantourClaims.LastName)?.Value;

                    _logger.LogWarning("User not found in database. UserId: {UserId}, Email: {Email}", userId, currentUser.Email);
                }

                // 4. Логика с ролями и AdminId
                var roleClaim = context.User.FindFirst(PlantourClaims.Role)?.Value;
                var adminIdStr = context.User.FindFirst(PlantourClaims.AdminId)?.Value;

                if (Enum.TryParse<UserRole>(roleClaim, true, out var parsedRole))
                {
                    currentUser.Role = parsedRole;
                }

                currentUser.Roles = currentUser.Role == UserRole.Public
                    ? new List<UserRole>()
                    : new List<UserRole> { currentUser.Role };

                if (currentUser.Role == UserRole.Admin)
                {
                    currentUser.AdminId = userId;
                    _logger.LogDebug("Admin user authenticated: {AdminId}", userId);
                }
                else if (currentUser.Role == UserRole.Participant && Guid.TryParse(adminIdStr, out var adminId))
                {
                    currentUser.AdminId = adminId;
                    _logger.LogDebug("Participant user authenticated: {ParticipantId}, AdminId: {AdminId}", userId, adminId);
                }

                currentUser.AccessRulesObject = context.User.FindFirst(PlantourClaims.AccessRules) != null
                    ? JsonSerializer.Deserialize<AccessRules>(context.User.FindFirst(PlantourClaims.AccessRules)?.Value ?? string.Empty) ?? new AccessRules()
                    : new AccessRules();    

                // Add user context to Serilog
                using (LogContext.PushProperty("UserId", currentUser.UserId))
                using (LogContext.PushProperty("UserEmail", currentUser.Email))
                using (LogContext.PushProperty("UserRole", currentUser.Role))
                {
                    // Continue with the request
                    context.Items["CurrentUser"] = currentUser;
                    await _next(context);
                    return;
                }
            }
        }

        _logger.LogDebug("Public user request");
        // Сохраняем результат для контроллеров
        context.Items["CurrentUser"] = currentUser;
        await _next(context);
    }
}