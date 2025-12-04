using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class TripRepository : BaseRepository
{
    private readonly DbSet<Trip> _dbSet;
    private readonly PlantourContext _context;

    public TripRepository(PlantourContext context, IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
    {
        _dbSet = context.Set<Trip>();
        _context = context;
    }

    public async Task<Trip?> GetByIdAsync(Guid id)
    {
        if (CurrentUser == null)
        {
            return null;
        }

        if (CurrentUser.IsAdmin)
        {
            return await _dbSet
                .Include(x => x.TripStatus)
                .FirstOrDefaultAsync(x => x.Id == id && x.UserId == CurrentUser.UserId);
        }

        if (CurrentUser.IsParticipant)
        {
            return await _dbSet
                .Include(x => x.TripStatus)
                .Include(x => x.TripUsers)
                .FirstOrDefaultAsync(x => x.Id == id && x.UserId == CurrentUser.AdminId && x.TripUsers.Any(y => y.UserId == CurrentUser.UserId));
        }

        return null;
    }

    public async Task<IEnumerable<Trip>> GetAllAsync(Guid id)
    {
        if (CurrentUser == null)
        {
            return Array.Empty<Trip>();
        }

        if (CurrentUser.IsAdmin)
        {
            return await _dbSet
                .Where(x => x.UserId == CurrentUser.UserId)
                .ToListAsync();
        }

        if (CurrentUser.IsParticipant)
        {
            return await _dbSet
                .Include(x => x.TripUsers)
                .Where(x => x.UserId == CurrentUser.AdminId && x.TripUsers.Any(y => y.UserId == CurrentUser.UserId))
                .ToListAsync();
        }

        return Array.Empty<Trip>();

    }

    public async Task AddAsync(Trip entity)
    {
        if (CurrentUser == null || !CurrentUser.IsAdmin)
        {
            throw new InvalidOperationException("Access denied");
        }

        entity.Id = Guid.NewGuid();
        entity.UserId = CurrentUser!.UserId!.Value;
        _context.Trips.Add(entity);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Trip entity)
    {
        if (CurrentUser == null || !CurrentUser.IsAdmin)
        {
            throw new InvalidOperationException("Access denied");
        }
        var existingEntity = await GetByIdAsync(entity.Id);
        if (existingEntity == null)
        {
            throw new InvalidOperationException("Trip not found");
        }
        _context.Trips.Attach(entity);
        _context.Entry(entity).State = EntityState.Modified;
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        if (CurrentUser == null || !CurrentUser.IsAdmin)
        {
            throw new InvalidOperationException("Access denied");
        }
        var entity = await GetByIdAsync(id);
        if (entity == null)
        {
            return;
        }
        _context.Trips.Remove(entity);
        await _context.SaveChangesAsync();
    }
}
