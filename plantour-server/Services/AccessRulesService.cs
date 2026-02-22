using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using plantour_server.Models;
using plantour_server.Services.Interfaces;
using plantour_server.Utils;
using PlantourApi.Middleware;
using PlantourApi.Models;

namespace plantour_server.Services;

public class AccessRulesService : IAccessRulesService
{
    private readonly CurrentUser _currentUser;

    public AccessRulesService(
        HttpCurrentUser httpCurrentUser
    )
    {
        _currentUser = httpCurrentUser.CurrentUser;
    }

    public Task<AccessRules> GetAccessRulesAsync()
    {
        throw new NotImplementedException();
    }
}
