using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class TripSharedTodoRepository(PlantourContext context) : GenericRepository<TripSharedTodo>(context)
{
    public async Task<IEnumerable<TripSharedTodo>> GetAllFullAsync(Guid tripId)
    {
        return await _dbSet
            .AsNoTracking()
            .Include(t => t.AssignedTo)
            .ThenInclude(t => t != null ? t.AdminParticipant.Participant : null)
            .Include(t => t.AssignedTo)
            .ThenInclude(t => t != null ? t.AdminParticipant.Admin : null)
            .Include(t => t.AssignedTodo)
            .Include(t => t.Trip)
            .Where(t => t.TripId == tripId)
            .ToListAsync();
    }

    public async Task<List<TripSharedTodo>> GetByIdsFullAsync(Guid tripId, IEnumerable<Guid> ids)
    {
        var idsList = ids.Distinct().ToList();
        if (idsList.Count == 0)
        {
            return [];
        }

        return await _dbSet
            .AsNoTracking()
            .Include(t => t.AssignedTo)
            .ThenInclude(t => t != null ? t.AdminParticipant.Participant : null)
            .Include(t => t.AssignedTo)
            .ThenInclude(t => t != null ? t.AdminParticipant.Admin : null)
            .Include(t => t.AssignedTodo)
            .Include(t => t.Trip)
            .Where(t => t.TripId == tripId && idsList.Contains(t.Id))
            .ToListAsync();
    }

    public async Task<int> CountAsync(Guid tripId)
    {
        return await _dbSet.CountAsync(x => x.TripId == tripId);
    }

    public async Task<IEnumerable<TripSharedTodo>> GetAllFullForAssigneeAsync(Guid tripId, Guid assigneeId)
    {
        return await _dbSet
            .AsNoTracking()
            .Include(t => t.AssignedTo)
            .ThenInclude(t => t != null ? t.AdminParticipant.Participant : null)
            .Include(t => t.AssignedTo)
            .ThenInclude(t => t != null ? t.AdminParticipant.Admin : null)
            .Include(t => t.AssignedTodo)
            .Include(t => t.Trip)
            .Where(t => t.TripId == tripId && (!t.AssignedToId.HasValue || t.AssignedToId == assigneeId))
            .ToListAsync();
    }

    public async Task<TripSharedTodo?> GetByIdFullAsync(Guid tripId, Guid id)
    {
        return await _dbSet
            .Include(t => t.AssignedTo)
            .ThenInclude(t => t != null ? t.AdminParticipant.Participant : null)
            .Include(t => t.AssignedTo)
            .ThenInclude(t => t != null ? t.AdminParticipant.Admin : null)
            .Include(t => t.AssignedTodo)
            .Include(t => t.Trip)
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