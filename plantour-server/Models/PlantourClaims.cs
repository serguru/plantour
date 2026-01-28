using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace plantour_server.Models;

public static class PlantourClaims
{
    public const string UserId = ClaimTypes.NameIdentifier;
    public const string Email = ClaimTypes.Email;
    public const string FirstName = ClaimTypes.GivenName;
    public const string LastName = ClaimTypes.Surname;
    public const string Role = ClaimTypes.Role;
    public const string AdminId = "admin_id";
    public const string AccessCode = "access_code";
    public const string Subject = JwtRegisteredClaimNames.Sub;
    public const string Expires = JwtRegisteredClaimNames.Exp;
    public const string Issuer = JwtRegisteredClaimNames.Iss;
    public const string Audience = JwtRegisteredClaimNames.Aud;
}

public static class PlantourRoles
{
    public const string Admin = "Admin";
    public const string Participant = "Participant";
}