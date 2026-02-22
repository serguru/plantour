using plantour_server.DTOs;
using plantour_server.Utils;

namespace plantour_server.Services;

public interface IAccessRulesService
{
    Task<AccessRules> GetAccessRulesAsync();

}