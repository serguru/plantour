using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class TripUserRepository : BaseRepository
{
    private readonly DbSet<TripUser> _dbSet;
    private readonly PlantourContext _context;

    public TripUserRepository(PlantourContext context, IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
    {
        _dbSet = context.Set<TripUser>();
        _context = context;
    }

    public async Task<TripUser?> GetByIdAsync(Guid id)
    {
        if (CurrentUser == null)
        {
            return null;
        }
        return await _dbSet
            .FirstOrDefaultAsync(x => x.Id == id && x.Trip.UserId == CurrentUser.UserId);
    }

    public async Task<IEnumerable<TripUser>> GetAllAsync(Guid tripId)
    {
        if (CurrentUser == null)
        {
            return Array.Empty<TripUser>();
        }

        return await _dbSet
            .Where(x => x.TripId == tripId && x.Trip.UserId == CurrentUser.UserId)
            .ToListAsync();
    }

    public async Task AddAsync(TripUser entity)
    {
        if (CurrentUser == null)
        {
            throw new InvalidOperationException("Access denied");
        }

        entity.Id = Guid.NewGuid();
        _context.TripUsers.Add(entity);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(TripUser entity)
    {
        if (CurrentUser == null)
        {
            throw new InvalidOperationException("Access denied");
        }

        var existingEntity = await GetByIdAsync(entity.Id);
        if (existingEntity == null)
        {
            throw new InvalidOperationException("TripUser not found");
        }

        _context.TripUsers.Attach(entity);
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

        _context.TripUsers.Remove(entity);
        await _context.SaveChangesAsync();
    }
}
