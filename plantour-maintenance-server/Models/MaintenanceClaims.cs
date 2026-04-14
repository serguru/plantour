using System.IdentityModel.Tokens.Jwt;

namespace plantour_maintenance_server.Models;

public static class MaintenanceClaims
{
    public const string Subject = JwtRegisteredClaimNames.Sub;
    public const string Email = JwtRegisteredClaimNames.Email;
    public const string Name = JwtRegisteredClaimNames.UniqueName;
}