using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using plantour_server.DbModels;
using plantour_maintenance_server.Models;
using plantour_maintenance_server.Services.Interfaces;

namespace plantour_maintenance_server.Services;

public class JwtTokenService(IOptions<JwtSettings> jwtSettings) : IJwtTokenService
{
    private readonly JwtSettings _jwtSettings = jwtSettings.Value;

    public AccessTokenResult CreateToken(Superuser superuser)
    {
        var expiresAtUtc = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes);
        var key = Encoding.UTF8.GetBytes(_jwtSettings.SecretKey);
        var handler = new JwtSecurityTokenHandler();

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, superuser.Id.ToString()),
            new(JwtRegisteredClaimNames.Sub, superuser.Id.ToString()),
            new(ClaimTypes.Email, superuser.Email),
            new(JwtRegisteredClaimNames.Email, superuser.Email),
            new(ClaimTypes.Name, superuser.Name),
            new(JwtRegisteredClaimNames.UniqueName, superuser.Name),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var descriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = expiresAtUtc,
            Issuer = _jwtSettings.Issuer,
            Audience = _jwtSettings.Audience,
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = handler.CreateToken(descriptor);

        return new AccessTokenResult
        {
            AccessToken = handler.WriteToken(token),
            ExpiresAtUtc = expiresAtUtc
        };
    }
}