using Microsoft.AspNetCore.Authorization;
using PlantourApi.Models;

namespace plantour_server.Attributes
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false)]
    public class ParticipantOnlyAttribute : AuthorizeAttribute
    {
        public ParticipantOnlyAttribute()
        {
            Policy = $"{UserRole.Participant}";
        }
    }
}
