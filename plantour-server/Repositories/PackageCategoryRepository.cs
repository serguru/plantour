using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class PackageCategoryRepository : GenericRepository<PackageCategory>
{
    public PackageCategoryRepository(PlantourContext context) : base(context)
    {
    }

    public override async Task<IEnumerable<PackageCategory>> GetAllAsync()
    {
        return await _dbSet.OrderBy(pc => pc.Name).ToListAsync();
    }
}
