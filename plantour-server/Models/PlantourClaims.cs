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
    public const string AccessRules = "access_rules";
    public const string Subject = JwtRegisteredClaimNames.Sub;
    public const string Expires = JwtRegisteredClaimNames.Exp;
    public const string Issuer = JwtRegisteredClaimNames.Iss;
    public const string Audience = JwtRegisteredClaimNames.Aud;
    public const string PaddleSubscriptionId = "paddle_subscription_id";
    public const string PaddleCustomerId = "paddle_customer_id";
}

public static class PlantourRoles
{
    public const string Admin = "Admin";
    public const string Participant = "Participant";
}