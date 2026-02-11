using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class UserRefreshTokenRepository(PlantourContext context) : GenericRepository<UserRefreshToken>(context)
{
    public async Task<UserRefreshToken?> GetByHashAsync(string tokenHash)
    {
        return await _dbSet.FirstOrDefaultAsync(x => x.TokenHash == tokenHash);
    }

    public async Task<UserRefreshToken?> GetActiveByHashAsync(string tokenHash)
    {
        var now = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
        return await _dbSet.FirstOrDefaultAsync(x =>
            x.TokenHash == tokenHash &&
            x.RevokedAt == null &&
            x.ExpiresAt > now);
    }
}
