using PlantourApi.Models;
using plantour_server.DbModels;
using plantour_server.Utils;

namespace plantour_server.Services;

public record AccessTokenResult(string Token, DateTime ExpiresAtUtc);
public record RefreshTokenResult(string Token, string TokenHash, DateTime ExpiresAtUtc, DateTime CreatedAtUtc);

public interface ITokenService
{
    Task<AccessTokenResult> CreateAccessToken(User user, UserRole role, Guid? adminId = null, bool isTemporary = false);
    RefreshTokenResult CreateRefreshToken();
    string HashToken(string token);
}
