using PlantourApi.Models;
using plantour_server.DbModels;
using plantour_server.Utils;
using System.Security.Claims;

namespace plantour_server.Services;

public record AccessTokenResult(string Token, DateTime ExpiresAtUtc);

public interface ITokenService
{
    Task<AccessTokenResult> CreateAccessToken(User user, UserRole role, Guid adminId, bool isTemporary = false);
    string HashToken(string token);

    List<KeyValuePair<string, string>> TokenToKeyValuePairs(string token);

    bool ValidateTokenExcludingExpired(string token);

    Task<RefreshToken> GenerateRefreshToken(Guid userId);
}
