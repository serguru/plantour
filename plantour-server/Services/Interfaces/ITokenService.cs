using PlantourApi.Models;
using plantour_server.DbModels;
using plantour_server.Utils;

namespace plantour_server.Services;

public record AccessTokenResult(string Token, DateTime ExpiresAtUtc);

public interface ITokenService
{
    Task<AccessTokenResult> CreateAccessToken(User user, UserRole role, Guid adminId, bool isTemporary = false);
    string HashToken(string token);
}
