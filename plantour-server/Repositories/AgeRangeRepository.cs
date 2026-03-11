using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class AgeRangeRepository : GenericRepository<AgeRange>
{

    public AgeRangeRepository(PlantourContext context) : base(context)
    {
    }

    public override async Task<IEnumerable<AgeRange>> GetAllAsync()
    {
        return await _dbSet
            .AsNoTracking()
            .ToListAsync();
    }


}