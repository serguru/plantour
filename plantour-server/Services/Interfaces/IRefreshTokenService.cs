using plantour_server.DbModels;
using PlantourApi.Models;

namespace plantour_server.Services;

public interface IRefreshTokenService
{
    Task<UserRefreshToken> CreateAsync(Guid userId, UserRole role, Guid adminId, RefreshTokenResult tokenResult, string? createdByIp);
    Task<UserRefreshToken?> GetActiveTokenAsync(string refreshToken);
    Task RotateAsync(UserRefreshToken existingToken, RefreshTokenResult newTokenResult, string? revokedByIp);
    Task RevokeAsync(string refreshToken, string? revokedByIp);
}
