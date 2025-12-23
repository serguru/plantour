using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class TripSharedRepository(PlantourContext context) : GenericRepository<TripSharedThing>(context)
{
    public async Task<IEnumerable<TripSharedThing>> GetAllFullAsync(Guid tripId)
    {
        return await _dbSet
            .Include(t => t.AddedBy.Trip.User)
            .Include(t => t.AssignedTo != null ? t.AssignedTo.Trip.User : null)
            .Include(t => t.AssignedThing)
            .Where(t => t.TripId == tripId)    
            .ToListAsync();
    }

}
