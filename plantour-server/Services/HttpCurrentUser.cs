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
            CurrentUser? result = null;
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext != null)
            {
                result = httpContext.Items["CurrentUser"] as CurrentUser;
            } else
            {
                result = new CurrentUser();
            }
            return result!;
        }
    }
}