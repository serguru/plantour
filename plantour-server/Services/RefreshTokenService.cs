using plantour_server.DbModels;
using plantour_server.Repositories;
using PlantourApi.Middleware;
using PlantourApi.Models;

// TODO: an access token must contain info on user's plan and price

namespace plantour_server.Services;

// TODO: before refreshing the token it is necessary to check with PaymentProcessor if the user's subscription is still active, since the user may have canceled the subscription or the payment may have failed, and we don't want to keep refreshing the token for users who are no longer active

public class RefreshTokenService : IRefreshTokenService
{
    private readonly UserRefreshTokenRepository _refreshTokenRepository;
    private readonly ITokenService _tokenService;

    private static DateTime ToTimestampWithoutTimeZone(DateTime value)
    {
        var utc = value.Kind == DateTimeKind.Local
            ? value.ToUniversalTime()
            : value;

        return DateTime.SpecifyKind(utc, DateTimeKind.Unspecified);
    }

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
            CreatedAt = ToTimestampWithoutTimeZone(tokenResult.CreatedAtUtc),
            ExpiresAt = ToTimestampWithoutTimeZone(tokenResult.ExpiresAtUtc),
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
        existingToken.RevokedAt = ToTimestampWithoutTimeZone(DateTime.UtcNow);
        existingToken.RevokedByIp = revokedByIp;
        existingToken.ReplacedByTokenHash = newTokenResult.TokenHash;
        await _refreshTokenRepository.UpdateAsync(existingToken);

        var existingTokenExpiresAtUtc = DateTime.SpecifyKind(existingToken.ExpiresAt, DateTimeKind.Utc);
        var cappedExpiresAtUtc = newTokenResult.ExpiresAtUtc <= existingTokenExpiresAtUtc
            ? newTokenResult.ExpiresAtUtc
            : existingTokenExpiresAtUtc;

        var cappedTokenResult = cappedExpiresAtUtc == newTokenResult.ExpiresAtUtc
            ? newTokenResult
            : new RefreshTokenResult(newTokenResult.Token, newTokenResult.TokenHash, cappedExpiresAtUtc, newTokenResult.CreatedAtUtc);

        var role = Enum.TryParse<UserRole>(existingToken.Role, out var parsedRole)
            ? parsedRole
            : throw new CustomException("Invalid user role");
            
        await CreateAsync(existingToken.UserId, role, existingToken.AdminId, cappedTokenResult, revokedByIp);
    }

    public async Task RevokeAsync(string refreshToken, string? revokedByIp)
    {
        var tokenHash = _tokenService.HashToken(refreshToken);
        var token = await _refreshTokenRepository.GetByHashAsync(tokenHash);
        if (token == null)
        {
            return;
        }

        token.RevokedAt = ToTimestampWithoutTimeZone(DateTime.UtcNow);
        token.RevokedByIp = revokedByIp;
        await _refreshTokenRepository.UpdateAsync(token);
    }
}
