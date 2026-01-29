using plantour_server.DbModels;
using plantour_server.Repositories;
using PlantourApi.Models;

namespace plantour_server.Services;

public class RefreshTokenService : IRefreshTokenService
{
    private readonly UserRefreshTokenRepository _refreshTokenRepository;
    private readonly ITokenService _tokenService;

    public RefreshTokenService(UserRefreshTokenRepository refreshTokenRepository, ITokenService tokenService)
    {
        _refreshTokenRepository = refreshTokenRepository;
        _tokenService = tokenService;
    }

    public async Task<UserRefreshToken> CreateAsync(Guid userId, UserRole role, Guid adminId, RefreshTokenResult tokenResult, string? createdByIp)
    {
        var refreshToken = new UserRefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Role = role.ToString(),
            AdminId = adminId,
            TokenHash = tokenResult.TokenHash,
            CreatedAt = tokenResult.CreatedAtUtc,
            ExpiresAt = tokenResult.ExpiresAtUtc,
            CreatedByIp = createdByIp
        };

        await _refreshTokenRepository.AddAsync(refreshToken);
        return refreshToken;
    }

    public async Task<UserRefreshToken?> GetActiveTokenAsync(string refreshToken)
    {
        var tokenHash = _tokenService.HashToken(refreshToken);
        return await _refreshTokenRepository.GetActiveByHashAsync(tokenHash);
    }

    public async Task<UserRefreshToken?> GetTokenAsync(string refreshToken)
    {
        var tokenHash = _tokenService.HashToken(refreshToken);
        return await _refreshTokenRepository.GetByHashAsync(tokenHash);
    }

    public async Task RotateAsync(UserRefreshToken existingToken, RefreshTokenResult newTokenResult, string? revokedByIp)
    {
        existingToken.RevokedAt = DateTime.UtcNow;
        existingToken.RevokedByIp = revokedByIp;
        existingToken.ReplacedByTokenHash = newTokenResult.TokenHash;
        await _refreshTokenRepository.UpdateAsync(existingToken);

        var role = Enum.TryParse<UserRole>(existingToken.Role, out var parsedRole)
            ? parsedRole
            : UserRole.Public;
        await CreateAsync(existingToken.UserId, role, existingToken.AdminId, newTokenResult, revokedByIp);
    }

    public async Task RevokeAsync(string refreshToken, string? revokedByIp)
    {
        var tokenHash = _tokenService.HashToken(refreshToken);
        var token = await _refreshTokenRepository.GetByHashAsync(tokenHash);
        if (token == null)
        {
            return;
        }

        token.RevokedAt = DateTime.UtcNow;
        token.RevokedByIp = revokedByIp;
        await _refreshTokenRepository.UpdateAsync(token);
    }
}
