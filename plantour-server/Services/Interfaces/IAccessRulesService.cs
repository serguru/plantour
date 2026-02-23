using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Models;
using plantour_server.Utils;
using PlantourApi.Models;

namespace plantour_server.Services;

public interface IAccessRulesService
{
    Task<AccessProcessResult> ProcessAccessRulesAsync(User user, UserRole role, bool isTemporary);


}