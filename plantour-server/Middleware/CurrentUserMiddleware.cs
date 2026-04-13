using System.Collections.Generic;
using Microsoft.Extensions.DependencyInjection;
using plantour_server.Models;
using PlantourApi.Models;
using plantour_server.Repositories;
using plantour_server.Services;
using System.Text.Json;
using plantour_server.Utils;

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
        var currentUser = new CurrentUser();

        if (context.User.Identity?.IsAuthenticated != true)
        {
            context.Items["CurrentUser"] = currentUser;
            await _next(context);
            return;
        }

        // Token validated successfully, we can extract user info from claims

        string? userIdStr = context.User.FindFirst(PlantourClaims.UserId)?.Value;

        if (String.IsNullOrWhiteSpace(userIdStr))
        {
            throw new CustomException("Empty user Id");
        }

        if (!Guid.TryParse(userIdStr, out var userId))
        {
            throw new CustomException("Wrong user Guid Id");
        }

        currentUser.UserId = userId;
        var roleClaim = context.User.FindFirst(PlantourClaims.Role)?.Value;
        if (!Enum.TryParse<UserRole>(roleClaim, true, out var parsedRole))
        {
            throw new CustomException("Wrong user role");
        }
        currentUser.Role = parsedRole;

        var adminIdStr = context.User.FindFirst(PlantourClaims.AdminId)?.Value;
        if (String.IsNullOrWhiteSpace(adminIdStr))
        {
            throw new CustomException("Empty admin Id");
        }
        if (!Guid.TryParse(adminIdStr, out var adminId))
        {
            throw new CustomException("Wrong admin Guid Id");
        }
        currentUser.AdminId = adminId;

        var emailClaim = context.User.FindFirst(PlantourClaims.Email)?.Value;
        if (String.IsNullOrWhiteSpace(emailClaim))
        {
            throw new CustomException("Empty email claim");
        }
        currentUser.Email = emailClaim;

        currentUser.FirstName = context.User.FindFirst(PlantourClaims.FirstName)?.Value;
        currentUser.LastName = context.User.FindFirst(PlantourClaims.LastName)?.Value;
        currentUser.Phone = context.User.FindFirst(PlantourClaims.Phone)?.Value;

        var temporary = context.User.FindFirst(PlantourClaims.Temporary)?.Value;
        currentUser.Temporary = temporary == "true";

        currentUser.PaddleSubscriptionId = context.User.FindFirst(PlantourClaims.PaddleSubscriptionId)?.Value;

        currentUser.BillingPeriodStart = context.User.FindFirst(PlantourClaims.BillingPeriodStart)?.Value;

        currentUser.BillingPeriodEnd = context.User.FindFirst(PlantourClaims.BillingPeriodEnd)?.Value;

        currentUser.PriceName = context.User.FindFirst(PlantourClaims.PlanPeriod)?.Value;

        currentUser.AccessRules = context.User.FindFirst(PlantourClaims.AccessRules) != null
            ? JsonSerializer.Deserialize<List<AccessRule>>(context.User.FindFirst(PlantourClaims.AccessRules)?.Value ?? string.Empty) ?? new List<AccessRule>()
            : new List<AccessRule>();

        context.Items["CurrentUser"] = currentUser;
        await _next(context);
    }
}