using System;
using System.Linq;
using Microsoft.AspNetCore.Authorization;
using PlantourApi.Models;

namespace PlantourApi.Authorization;

public class UserRoleRequirement : IAuthorizationRequirement
{
    public UserRole[] AllowedRoles { get; }

    public UserRoleRequirement(params UserRole[] allowedRoles)
    {
        AllowedRoles = allowedRoles;
    }
}

public class UserRoleHandler : AuthorizationHandler<UserRoleRequirement>
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public UserRoleHandler(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        UserRoleRequirement requirement)
    {
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext == null)
        {
            context.Fail();
            return Task.CompletedTask;
        }

        var currentUser = httpContext.Items["CurrentUser"] as CurrentUser;
        if (currentUser == null)
        {
            context.Fail();
            return Task.CompletedTask;
        }

        if (Array.IndexOf(requirement.AllowedRoles, currentUser.Role) >= 0)
        {
            context.Succeed(requirement);
        }
        else
        {
            context.Fail();
        }

        return Task.CompletedTask;
    }
}