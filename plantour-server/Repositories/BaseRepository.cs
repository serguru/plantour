using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;
using PlantourApi.Models;
using System.Linq.Expressions;

namespace plantour_server.Repositories;

public abstract class BaseRepository
{
    protected readonly IHttpContextAccessor _httpContextAccessor;
    protected BaseRepository(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }
    public CurrentUser? CurrentUser
    {
        get
        {
            var httpContext = _httpContextAccessor.HttpContext;
            var result = httpContext?.Items["CurrentUser"] as CurrentUser;
            return result;
        }
    }
}