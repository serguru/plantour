using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class TripUserThingRepository : BaseRepository
{
    private readonly DbSet<TripUserThing> _dbSet;
    private readonly PlantourContext _context;

    public TripUserThingRepository(PlantourContext context, IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
    {
        _dbSet = context.Set<TripUserThing>();
        _context = context;
    }

    public async Task<TripUserThing?> GetByIdAsync(Guid id)
    {
        if (CurrentUser == null)
        {
            return null;
        }
        return await _dbSet
            .Include(x => x.TripUserPackage)
            .FirstOrDefaultAsync(x => x.Id == id && x.TripUser.Trip.UserId == CurrentUser.UserId);
    }

    public async Task<IEnumerable<TripUserThing>> GetAllAsync(Guid tripId)
    {
        if (CurrentUser == null)
        {
            return Array.Empty<TripUserThing>();
        }

        return await _dbSet
            .Include(x => x.TripUserPackage)
            .Where(x => x.TripUser.TripId == tripId && x.TripUser.Trip.UserId == CurrentUser.UserId)
            .ToListAsync();
    }

    public async Task AddAsync(Guid tripId, TripUserThing entity)
    {
        if (CurrentUser == null)
        {
            throw new InvalidOperationException("Access denied");
        }

        var tripUser = await _context.TripUsers
            .FirstOrDefaultAsync(x => x.TripId == tripId && x.Trip.UserId == CurrentUser.UserId); 
            
        if (tripUser == null)
        {
            throw new InvalidOperationException("Access denied");
        }

        entity.Id = Guid.NewGuid();
        entity.TripUserId = tripUser.Id;
        _context.TripUserThings.Add(entity);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(TripUserThing entity)
    {
        if (CurrentUser == null)
        {
            throw new InvalidOperationException("Access denied");
        }

        var existingEntity = await GetByIdAsync(entity.Id);
        if (existingEntity == null)
        {
            throw new InvalidOperationException("TripUserThing not found");
        }

        _context.TripUserThings.Attach(entity);
        _context.Entry(entity).State = EntityState.Modified;
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        if (CurrentUser == null)
        {
            throw new InvalidOperationException("Access denied");
        }

        var entity = await GetByIdAsync(id);
        if (entity == null)
        {
            return;
        }

        _context.TripUserThings.Remove(entity);
        await _context.SaveChangesAsync();
    }
}
