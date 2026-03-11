using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class ThingCategoryRepository : GenericRepository<ThingCategory>
{

    public ThingCategoryRepository(PlantourContext context) : base(context)
    {
    }

    public override async Task<IEnumerable<ThingCategory>> GetAllAsync()
    {
        return await _dbSet
            .AsNoTracking()
            .ToListAsync();
    }


}
