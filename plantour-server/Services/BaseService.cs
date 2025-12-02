using PlantourApi.Models;

namespace plantour_server.Services;

public abstract class BaseService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    protected BaseService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    protected CurrentUser? CurrentUser
    {
        get
        {
            var httpContext = _httpContextAccessor.HttpContext;
            return httpContext?.Items["CurrentUser"] as CurrentUser;
        }
    }
}
