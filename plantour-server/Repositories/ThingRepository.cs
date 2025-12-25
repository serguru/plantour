using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class ThingRepository(PlantourContext context) : GenericRepository<UserThing>(context)
{

    public async Task<UserThing?> GetByIdAsync(Guid userId, Guid id)
    {
        return await _dbSet
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);
    }

}
