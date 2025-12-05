using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class TripUserPackageRepository : BaseRepository
{
    private readonly DbSet<TripUserPackage> _dbSet;
    private readonly PlantourContext _context;

    public TripUserPackageRepository(PlantourContext context, IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
    {
        _dbSet = context.Set<TripUserPackage>();
        _context = context;
    }

    public async Task<TripUserPackage?> GetByIdAsync(Guid id)
    {
        if (CurrentUser == null)
        {
            return null;
        }
        return await _dbSet
            .FirstOrDefaultAsync(x => x.Id == id && x.TripUser.UserId == CurrentUser.UserId);
    }

    public async Task<IEnumerable<TripUserPackage>> GetAllAsync(Guid tripId)
    {
        if (CurrentUser == null)
        {
            return Array.Empty<TripUserPackage>();
        }

        return await _dbSet
            .Where(x => x.TripUser.TripId == tripId && x.TripUser.UserId == CurrentUser.UserId)
            .ToListAsync();
    }

    public async Task AddAsync(Guid tripId, TripUserPackage entity)
    {
        if (CurrentUser == null)
        {
            throw new InvalidOperationException("Access denied");
        }

        var tripUser = await _context.TripUsers
            .FirstOrDefaultAsync(x => x.TripId == tripId && x.UserId == CurrentUser.UserId); 
            
        if (tripUser == null)
        {
            throw new InvalidOperationException("Access denied");
        }

        entity.Id = Guid.NewGuid();
        entity.TripUserId = tripUser.Id;
        _context.TripUserPackages.Add(entity);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(TripUserPackage entity)
    {
        if (CurrentUser == null)
        {
            throw new InvalidOperationException("Access denied");
        }

        var existingEntity = await GetByIdAsync(entity.Id);
        if (existingEntity == null)
        {
            throw new InvalidOperationException("TripUserPackage not found");
        }

        _context.TripUserPackages.Attach(entity);
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

        _context.TripUserPackages.Remove(entity);
        await _context.SaveChangesAsync();
    }
}
