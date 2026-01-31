using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;
using plantour_server.DTOs;

namespace plantour_server.Repositories;

public class TripSharedRepository(PlantourContext context) : GenericRepository<TripSharedThing>(context)
{
    public async Task AddRangeAsync(IEnumerable<TripSharedThing> entities)
    {
        await _dbSet.AddRangeAsync(entities);
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<TripSharedThing>> GetAllFullAsync(Guid tripId)
    {
        return await _dbSet
            .Include(t => t.AssignedTo)
            .ThenInclude(t => t != null ? t.AdminParticipant.Participant : null)
            .Include(t => t.AssignedThing)
            .Where(t => t.TripId == tripId)    
            .ToListAsync();
    }

    public async Task<IEnumerable<TripSharedThing>> GetAllFullForAssigneeAsync(Guid tripId, Guid assigneeId)
    {
        return await _dbSet
            .Include(t => t.AssignedTo)
            .ThenInclude(t => t != null ? t.AdminParticipant.Participant : null)
            .Include(t => t.AssignedThing)
            .Where(t => t.TripId == tripId && (!t.AssignedToId.HasValue || t.AssignedToId == assigneeId))    
            .ToListAsync();
    }

    public async Task<TripSharedThing?> GetByIdFullAsync(Guid tripId, Guid id)
    {
        return await _dbSet
            .Include(t => t.AssignedTo)
            .ThenInclude(t => t != null ? t.AdminParticipant.Participant : null)
            .Include(t => t.AssignedThing)
            .FirstOrDefaultAsync(t => t.TripId == tripId && t.Id == id);
    }

    public async Task DeleteAsync(Guid tripId, Guid id)
    {
        var entity = await FindAsync(x => x.Id == id && x.TripId == tripId).ContinueWith(t => t.Result.FirstOrDefault());
        if (entity != null)
        {
            _dbSet.Remove(entity);
            await _context.SaveChangesAsync();
        }
    }
}
