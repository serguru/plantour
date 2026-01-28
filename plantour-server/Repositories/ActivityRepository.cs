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
        return await _dbSet.FirstOrDefaultAsync(x => x.Name == name);
    }





}