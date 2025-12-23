using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class TripThingRepository : BaseRepository
{
    private readonly DbSet<TripUserThing> _dbSet;
    private readonly PlantourContext _context;

    public TripThingRepository(PlantourContext context, IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
    {
        _dbSet = context.Set<TripUserThing>();
        _context = context;
    }

    public async Task<bool> AnyByIdAsync(Guid tripId, Guid id)
    {
        if (CurrentUser == null)
        {
            return false;
        }

        if (CurrentUser.IsAdmin)
        {
            return await _dbSet
                .Include(x => x.TripUserPackage)
                .AnyAsync(x =>
                    x.TripUser.TripId == tripId &&
                    x.Id == id &&
                    x.TripUser.Trip.UserId == CurrentUser.UserId &&
                    x.TripUser.AdminParticipant.AdminId == CurrentUser.UserId &&
                    x.TripUser.AdminParticipant.ParticipantId == CurrentUser.UserId
                    );
        }

        if (CurrentUser.IsParticipant)
        {
            return await _dbSet
                .Include(x => x.TripUserPackage)
                .AnyAsync(x =>
                    x.TripUser.TripId == tripId &&
                    x.Id == id &&
                    x.TripUser.Trip.UserId == CurrentUser.AdminId &&
                    x.TripUser.AdminParticipant.AdminId == CurrentUser.AdminId &&
                    x.TripUser.AdminParticipant.ParticipantId == CurrentUser.UserId
                    );
        }

        return false;
    }
    public async Task<TripUserThing?> GetByIdAsync(Guid tripId, Guid id)
    {
        if (CurrentUser == null)
        {
            return null;
        }

        if (CurrentUser.IsAdmin)
        {
            return await _dbSet
                .Include(x => x.TripUserPackage)
                .FirstOrDefaultAsync(x =>
                    x.TripUser.TripId == tripId &&
                    x.Id == id &&
                    x.TripUser.Trip.UserId == CurrentUser.UserId &&
                    x.TripUser.AdminParticipant.AdminId == CurrentUser.UserId &&
                    x.TripUser.AdminParticipant.ParticipantId == CurrentUser.UserId
                    );
        }

        if (CurrentUser.IsParticipant)
        {
            return await _dbSet
                .Include(x => x.TripUserPackage)
                .FirstOrDefaultAsync(x =>
                    x.TripUser.TripId == tripId &&
                    x.Id == id &&
                    x.TripUser.Trip.UserId == CurrentUser.AdminId &&
                    x.TripUser.AdminParticipant.AdminId == CurrentUser.AdminId &&
                    x.TripUser.AdminParticipant.ParticipantId == CurrentUser.UserId
                    );
        }

        return null;
    }

    public async Task<IEnumerable<TripUserThing>> GetAllAsync(Guid tripId)
    {
        if (CurrentUser == null)
        {
            return Array.Empty<TripUserThing>();
        }

        if (CurrentUser.IsAdmin)
        {
            return await _dbSet
                .Include(x => x.TripUserPackage)
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
                .Include(x => x.TripUserPackage)
                .Where(x =>
                    x.TripUser.TripId == tripId &&
                    x.TripUser.Trip.UserId == CurrentUser.AdminId &&
                    x.TripUser.AdminParticipant.AdminId == CurrentUser.AdminId &&
                    x.TripUser.AdminParticipant.ParticipantId == CurrentUser.UserId
                ).ToListAsync();
        }

        return Array.Empty<TripUserThing>();
    }

    public async Task AddAsync(Guid tripId, TripUserThing entity)
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
        _context.TripUserThings.Add(entity);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Guid tripId, TripUserThing entity)
    {
        if (CurrentUser == null)
        {
            throw new InvalidOperationException("Access denied");
        }

        var existingEntity = await GetByIdAsync(tripId, entity.Id);
        if (existingEntity == null)
        {
            throw new InvalidOperationException("TripUserThing not found");
        }

        _context.TripUserThings.Attach(entity);
        _context.Entry(entity).State = EntityState.Modified;
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid tripId, Guid id)
    {
        if (CurrentUser == null)
        {
            throw new InvalidOperationException("Access denied");
        }

        var entity = await GetByIdAsync(tripId, id);
        if (entity == null)
        {
            return;
        }

        _context.TripUserThings.Remove(entity);
        await _context.SaveChangesAsync();
    }
}
