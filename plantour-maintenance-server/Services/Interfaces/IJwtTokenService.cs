using plantour_server.DbModels;
using plantour_maintenance_server.Models;

namespace plantour_maintenance_server.Services.Interfaces;

public interface IJwtTokenService
{
    AccessTokenResult CreateToken(Superuser superuser);
}