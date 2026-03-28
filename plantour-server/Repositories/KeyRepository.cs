using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class KeyRepository(PlantourContext context) : GenericRepository<UserKey>(context)
{
    public async Task<UserKey?> GetByIdAsync(Guid userId, Guid id)
    {
        return await _dbSet
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);
    }

    public async Task<UserKey?> GetByNameAsync(Guid userId, string name)
    {
        var normalizedName = name.Trim().ToLower();

        return await _dbSet
            .FirstOrDefaultAsync(x => x.UserId == userId && x.Name.ToLower() == normalizedName);
    }
}