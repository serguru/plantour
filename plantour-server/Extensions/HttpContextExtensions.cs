using PlantourApi.Models;

namespace PlantourApi.Extensions;

public static class HttpContextExtensions
{
    public static CurrentUser GetCurrentUser(this HttpContext context)
    {
        return context.Items["CurrentUser"] as CurrentUser
            ?? new CurrentUser { Role = UserRole.Public };
    }

}