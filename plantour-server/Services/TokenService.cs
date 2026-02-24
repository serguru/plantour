using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using plantour_server.DbModels;
using plantour_server.Models;
using plantour_server.Utils;
using PlantourApi.Models;

namespace plantour_server.Services;

// TODO: check why add traveler form does not close automatically after adding a traveler
public class TokenService : ITokenService
{
    private readonly JwtSettings _jwtSettings;

    private readonly IAccessRulesService _accessRulesService;

    public TokenService(IOptions<JwtSettings> jwtSettings, IAccessRulesService accessRulesService)
    {
        _jwtSettings = jwtSettings.Value;
        _accessRulesService = accessRulesService;
    }


    // TODO: for ACTIVE users only!!!
    public async Task<AccessTokenResult> CreateAccessToken(User user, UserRole role, Guid adminId, bool isTemporary = false)
    {
        var handler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_jwtSettings.SecretKey);
        DateTime expiresAtUtc;
        if (isTemporary)
        {
            expiresAtUtc = DateTime.UtcNow.AddDays(_jwtSettings.TemporaryUserAccessTokenExpirationDays);
        }
        else
        {
            expiresAtUtc = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes);
        }
        

        AccessProcessResult accessProcessResult = await _accessRulesService.ProcessAccessRulesAsync(user, role, adminId, isTemporary);

        user = accessProcessResult.UserObject; // Get the updated user object with the latest plan and access type details

        var rules = accessProcessResult.AccessRulesObject.GetAllRules();

        var claims = new List<Claim>
        {
            new(PlantourClaims.UserId, user.Id.ToString()),
            new(PlantourClaims.Email, user.Email),
            new(PlantourClaims.FirstName, user.FirstName ?? string.Empty),
            new(PlantourClaims.LastName, user.LastName ?? string.Empty),
            new(PlantourClaims.Role, role.ToString()),
            new(PlantourClaims.PaddleSubscriptionId, user.PaddleSubscriptionId ?? string.Empty),
            new(PlantourClaims.AccessRules, JsonSerializer.Serialize(rules)),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        if (role == UserRole.Participant)
        {
            claims.Add(new Claim(PlantourClaims.AdminId, adminId.ToString()));
        }

        if (isTemporary)
        {
            claims.Add(new Claim("temporary", "true"));
        }

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = expiresAtUtc,
            Issuer = _jwtSettings.Issuer,
            Audience = _jwtSettings.Audience,
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature)
        };

        var token = handler.CreateToken(tokenDescriptor);

        return new AccessTokenResult(handler.WriteToken(token), expiresAtUtc);
    }

    public RefreshTokenResult CreateRefreshToken()
    {
        var createdAtUtc = DateTime.UtcNow;
        var expiresAtUtc = createdAtUtc.AddDays(_jwtSettings.RefreshTokenExpirationDays);
        var tokenBytes = RandomNumberGenerator.GetBytes(64);
        var token = Convert.ToBase64String(tokenBytes);
        var tokenHash = HashToken(token);
        return new RefreshTokenResult(token, tokenHash, expiresAtUtc, createdAtUtc);
    }

    public string HashToken(string token)
    {
        var bytes = Encoding.UTF8.GetBytes(token);
        var hashBytes = SHA256.HashData(bytes);
        return Convert.ToHexString(hashBytes).ToLowerInvariant();
    }
}
