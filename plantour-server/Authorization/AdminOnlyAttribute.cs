using Microsoft.AspNetCore.Authorization;
using PlantourApi.Models;

namespace plantour_server.Attributes
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false)]
    public class AdminOnlyAttribute : AuthorizeAttribute
    {
        public AdminOnlyAttribute()
        {
            Policy = "AdminOnly";
        }
    }
}
