using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class TripSharedExpenseRepository(PlantourContext context) : GenericRepository<TripSharedExpense>(context)
{
    public async Task<IEnumerable<TripSharedExpense>> GetAllFullAsync(Guid tripId)
    {
        return await _dbSet
            .AsNoTracking()
            .Include(x => x.Trip)
            .Where(x => x.TripId == tripId)
            .ToListAsync();
    }

    public async Task<List<TripSharedExpense>> GetByIdsFullAsync(Guid tripId, IEnumerable<Guid> ids)
    {
        var idsList = ids.Distinct().ToList();
        if (idsList.Count == 0)
        {
            return [];
        }

        return await _dbSet
            .AsNoTracking()
            .Include(x => x.Trip)
            .Where(x => x.TripId == tripId && idsList.Contains(x.Id))
            .ToListAsync();
    }

    public async Task<int> CountAsync(Guid tripId)
    {
        return await _dbSet.CountAsync(x => x.TripId == tripId);
    }

    public async Task<TripSharedExpense?> GetByIdFullAsync(Guid tripId, Guid id)
    {
        return await _dbSet
            .Include(x => x.Trip)
            .FirstOrDefaultAsync(x => x.TripId == tripId && x.Id == id);
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