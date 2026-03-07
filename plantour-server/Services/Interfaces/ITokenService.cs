using PlantourApi.Models;
using plantour_server.DbModels;
using plantour_server.Utils;
using System.Security.Claims;
using plantour_server.Models;

namespace plantour_server.Services;

public record AccessTokenResult(string Token, DateTime ExpiresAtUtc, AccessRule[] Rules);

public interface ITokenService
{
    Task<AccessTokenResult> CreateAccessToken(User user, UserRole role, Guid adminId);
    string HashToken(string token);

    List<KeyValuePair<string, string>> TokenToKeyValuePairs(string token);

    bool ValidateTokenExcludingExpired(string token);

    Task<RefreshToken> GenerateRefreshToken(Guid userId);
}
