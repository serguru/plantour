using Microsoft.AspNetCore.Authorization;

namespace plantour_server.Authorization;

public class AdminRequirement : IAuthorizationRequirement
{
}

public class AdminAuthorizationHandler : AuthorizationHandler<AdminRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context, 
        AdminRequirement requirement)
    {
        var roleClaim = context.User.FindFirst("role");
        
        if (roleClaim?.Value == "Admin")
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}