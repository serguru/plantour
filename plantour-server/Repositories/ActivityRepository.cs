using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class ActivityRepository : GenericRepository<Activity>
{

    public ActivityRepository(PlantourContext context) : base(context)
    {
    }

    public async Task<Activity?> GetByName(string name)
    {
        return await _dbSet
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Name == name);
    }

    public override async Task<IEnumerable<Activity>> GetAllAsync()
    {
        return await _dbSet
            .AsNoTracking()
            .ToListAsync();
    }





}