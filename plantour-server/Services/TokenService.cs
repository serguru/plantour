using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using plantour_server.DbModels;
using plantour_server.Models;
using plantour_server.Repositories;
using plantour_server.Utils;
using PlantourApi.Models;

namespace plantour_server.Services;

// TODO: check why add traveler form does not close automatically after adding a traveler
public class TokenService : ITokenService
{
    private readonly JwtSettings _jwtSettings;

    private readonly IAccessRulesService _accessRulesService;

    private readonly RefreshTokenRepository _refreshTokenRepository;

    public TokenService(IOptions<JwtSettings> jwtSettings, IAccessRulesService accessRulesService, RefreshTokenRepository refreshTokenRepository)
    {
        _jwtSettings = jwtSettings.Value;
        _accessRulesService = accessRulesService;
        _refreshTokenRepository = refreshTokenRepository;
    }


    // TODO: for ACTIVE users only!!!
    // TODO: a background scheduler must clear old rferesh tokens and AI prompts from the DB

    // For temporary a new user is created, otherwise they are retrieved from the DB
    public async Task<AccessTokenResult> CreateAccessToken(User user, UserRole role, Guid adminId, bool isTemporary = false)
    {
        var handler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_jwtSettings.SecretKey);
        DateTime expiresAtUtc = DateTime.UtcNow;

        if (isTemporary)
        {
            expiresAtUtc = expiresAtUtc.AddDays(_jwtSettings.TemporaryUserAccessTokenExpirationDays);
        }
        else
        {
            expiresAtUtc = expiresAtUtc.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes);
        }

        AccessProcessResult accessProcessResult = await _accessRulesService.ProcessAccessRulesAsync(user, role, adminId, isTemporary);

        user = accessProcessResult.UserObject; // Get the updated user object with the latest PriceEnumId and access type details

        var rules = accessProcessResult.AccessRulesObject.GetAllRules();

        var claims = new List<Claim>
        {
            new(PlantourClaims.UserId, user.Id.ToString()),
            new(PlantourClaims.Email, user.Email),
            new(PlantourClaims.FirstName, user.FirstName ?? string.Empty),
            new(PlantourClaims.LastName, user.LastName ?? string.Empty),
            new(PlantourClaims.Role, role.ToString()),
            new(PlantourClaims.PlanPeriod, accessProcessResult.PriceName),
            new(PlantourClaims.BillingPeriodStart, accessProcessResult.BillingPeriodStart ?? string.Empty),
            new(PlantourClaims.BillingPeriodEnd, accessProcessResult.BillingPeriodEnd ?? string.Empty),
            new(PlantourClaims.PaddleSubscriptionId, user.PaddleSubscriptionId ?? string.Empty),
            new(PlantourClaims.AccessRules, JsonSerializer.Serialize(rules)),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        if (role == UserRole.Participant)
        {
            claims.Add(new Claim(PlantourClaims.AdminId, adminId.ToString()));
        }

        claims.Add(new Claim("temporary", isTemporary ? "true" : "false"));

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

        return new AccessTokenResult(handler.WriteToken(token), expiresAtUtc, rules);
    }


    public string HashToken(string token)
    {
        var bytes = Encoding.UTF8.GetBytes(token);
        var hashBytes = SHA256.HashData(bytes);
        return Convert.ToHexString(hashBytes).ToLowerInvariant();
    }

    public async Task<RefreshToken> GenerateRefreshToken(Guid userId)
    {
        var now = DateTime.UtcNow;
        var expiresAt = now.AddDays(_jwtSettings.RefreshTokenExpirationDays);
        Guid token = Guid.NewGuid();

        var result = await _refreshTokenRepository.AddAsync(new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Token = token,
            ExpiresAt = expiresAt,
            CreatedAt = now
        });

        return result;
    }

    public List<KeyValuePair<string, string>> TokenToKeyValuePairs(string token)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            throw new ArgumentException("Token cannot be null or empty.", nameof(token));
        }

        token = token.Trim();
        if (token.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            token = token["Bearer ".Length..].Trim();
        }

        var handler = new JwtSecurityTokenHandler();
        if (!handler.CanReadToken(token))
        {
            throw new SecurityTokenException("Invalid JWT format.");
        }

        JwtSecurityToken jwtToken;
        try
        {
            jwtToken = handler.ReadJwtToken(token);
        }
        catch (Exception ex)
        {
            throw new SecurityTokenException("Failed to parse JWT token.", ex);
        }

        List<KeyValuePair<string, string>> result = new();

        foreach (var claim in jwtToken.Claims)
        {
            result.Add(new KeyValuePair<string, string>(claim.Type, claim.Value));
        }

        return result;

    }

    public bool ValidateTokenExcludingExpired(string token)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            return false;
        }

        token = token.Trim();
        if (token.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            token = token["Bearer ".Length..].Trim();
        }

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_jwtSettings.SecretKey);

        var validationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = true,
            ValidIssuer = _jwtSettings.Issuer,
            ValidateAudience = true,
            ValidAudience = _jwtSettings.Audience,
            ValidateLifetime = false,
            ClockSkew = TimeSpan.Zero
        };

        try
        {
            tokenHandler.ValidateToken(token, validationParameters, out var validatedToken);

            if (validatedToken is not JwtSecurityToken jwt ||
                !string.Equals(jwt.Header.Alg, SecurityAlgorithms.HmacSha256, StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }
            return true;
        }
        catch
        {
            return false;
        }
    }

}
