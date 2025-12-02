using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class PackageCategoryRepository : GenericRepository<PackageCategory>
{
    public PackageCategoryRepository(PlantourContext context) : base(context)
    {
    }

    public override async Task<PackageCategory?> GetByIdAsync(Guid id)
    {
        return await _dbSet
            .Include(pc => pc.UserPackages)
            .FirstOrDefaultAsync(pc => pc.Id == id);
    }

    public override async Task<IEnumerable<PackageCategory>> GetAllAsync()
    {
        return await _dbSet.OrderBy(pc => pc.Name).ToListAsync();
    }

    public async Task<PackageCategory?> GetByNameAsync(string name)
    {
        return await _dbSet
            .Include(pc => pc.UserPackages)
            .FirstOrDefaultAsync(pc => pc.Name == name);
    }

    public async Task<bool> ExistsByNameAsync(string name)
    {
        return await _dbSet.AnyAsync(pc => pc.Name == name);
    }
}
