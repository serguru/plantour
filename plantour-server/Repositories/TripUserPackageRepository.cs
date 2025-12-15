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
        if (CurrentUser.IsAdmin)
        {
            return await _dbSet
                .FirstOrDefaultAsync(x =>
                    x.Id == id &&
                    x.TripUser.Trip.UserId == CurrentUser.UserId &&
                    x.TripUser.AdminParticipant.AdminId == CurrentUser.UserId &&
                    x.TripUser.AdminParticipant.ParticipantId == CurrentUser.UserId
                    );
        }

        if (CurrentUser.IsParticipant)
        {
            return await _dbSet
                .FirstOrDefaultAsync(x =>
                    x.Id == id &&
                    x.TripUser.Trip.UserId == CurrentUser.AdminId &&
                    x.TripUser.AdminParticipant.AdminId == CurrentUser.AdminId &&
                    x.TripUser.AdminParticipant.ParticipantId == CurrentUser.UserId
                    );
        }

        return null;
    }

    public async Task<IEnumerable<TripUserPackage>> GetAllAsync(Guid tripId)
    {
        if (CurrentUser == null)
        {
            return Array.Empty<TripUserPackage>();
        }
        if (CurrentUser.IsAdmin)
        {
            return await _dbSet
                .Where(x =>
                    x.TripUser.TripId == tripId &&
                    x.TripUser.Trip.UserId == CurrentUser.UserId &&
                    x.TripUser.AdminParticipant.AdminId == CurrentUser.UserId &&
                    x.TripUser.AdminParticipant.ParticipantId == CurrentUser.UserId
                ).ToListAsync();
        }

        if (CurrentUser.IsParticipant)
        {
            return await _dbSet
                .Where(x =>
                    x.TripUser.TripId == tripId &&
                    x.TripUser.Trip.UserId == CurrentUser.AdminId &&
                    x.TripUser.AdminParticipant.AdminId == CurrentUser.AdminId &&
                    x.TripUser.AdminParticipant.ParticipantId == CurrentUser.UserId
                ).ToListAsync();
        }
        
        return Array.Empty<TripUserPackage>();
    }

    public async Task AddAsync(Guid tripId, TripUserPackage entity)
    {
        if (CurrentUser == null)
        {
            throw new InvalidOperationException("Access denied");
        }

        TripUser? tripUser = null;

        if (CurrentUser.IsAdmin)
        {
            tripUser = await _context.TripUsers
                .FirstOrDefaultAsync(x =>
                    x.Trip.UserId == CurrentUser.UserId &&
                    x.AdminParticipant.AdminId == CurrentUser.UserId &&
                    x.AdminParticipant.ParticipantId == CurrentUser.UserId
                    );
        }

        if (CurrentUser.IsParticipant)
        {
            tripUser = await _context.TripUsers
                .FirstOrDefaultAsync(x =>
                    x.Trip.UserId == CurrentUser.AdminId &&
                    x.AdminParticipant.AdminId == CurrentUser.AdminId &&
                    x.AdminParticipant.ParticipantId == CurrentUser.UserId
                    );
        }

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
