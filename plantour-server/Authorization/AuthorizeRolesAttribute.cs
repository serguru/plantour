using Microsoft.AspNetCore.Authorization;
using PlantourApi.Models;

namespace PlantourApi.Authorization
{

    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true)]
    public class AuthorizeRolesAttribute : AuthorizeAttribute
    {
        public AuthorizeRolesAttribute(params UserRole[] roles)
        {
            Policy = string.Join(",", roles.Select(r => r.ToString()));
        }
    }
}