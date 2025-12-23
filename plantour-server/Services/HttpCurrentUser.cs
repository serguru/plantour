using PlantourApi.Models;

namespace plantour_server.Services;

public class HttpCurrentUser
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public HttpCurrentUser(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public CurrentUser CurrentUser
    {
        get
        {
            var httpContext = _httpContextAccessor.HttpContext;
            var result = httpContext!.Items["CurrentUser"] as CurrentUser;
            return result!;
        }
    }
}