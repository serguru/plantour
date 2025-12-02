using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class UserPackageRepository : GenericRepository<UserPackage>
{
    public UserPackageRepository(PlantourContext context) : base(context)
    {
    }

    public override async Task<UserPackage?> GetByIdAsync(Guid id)
    {
        return await _dbSet
            .Include(up => up.User)
            .Include(up => up.Category)
            .Include(up => up.TripUserPackages)
            .FirstOrDefaultAsync(up => up.Id == id);
    }

    public override async Task<IEnumerable<UserPackage>> GetAllAsync()
    {
        return await _dbSet
            .Include(up => up.User)
            .Include(up => up.Category)
            .ToListAsync();
    }

    public async Task<IEnumerable<UserPackage>> GetByUserIdAsync(Guid userId)
    {
        return await _dbSet
            .Include(up => up.Category)
            .Include(up => up.TripUserPackages)
            .Where(up => up.UserId == userId)
            .ToListAsync();
    }

    public async Task<IEnumerable<UserPackage>> GetByCategoryIdAsync(Guid categoryId)
    {
        return await _dbSet
            .Include(up => up.User)
            .Include(up => up.TripUserPackages)
            .Where(up => up.CategoryId == categoryId)
            .ToListAsync();
    }

    public async Task<UserPackage?> GetByUserAndDescriptionAsync(Guid userId, string shortDescription)
    {
        return await _dbSet
            .Include(up => up.Category)
            .FirstOrDefaultAsync(up => up.UserId == userId && up.ShortDescription == shortDescription);
    }
}
