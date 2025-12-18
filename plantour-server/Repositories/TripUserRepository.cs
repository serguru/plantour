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
        if (CurrentUser.IsAdmin)
        {
            return await _dbSet
                .FirstOrDefaultAsync(x => x.Id == id && x.AdminParticipant.AdminId == CurrentUser.UserId);
        }

        if (CurrentUser.IsParticipant)
        {
            return await _dbSet
                .FirstOrDefaultAsync(x => x.Id == id && x.AdminParticipant.AdminId == CurrentUser.AdminId);
        }
        return null;
    }

    public async Task<IEnumerable<TripUser>> GetAllAsync(Guid tripId)
    {
        if (CurrentUser == null)
        {
            return Array.Empty<TripUser>();
        }
        if (CurrentUser.IsAdmin)
        {
            return await _dbSet
                .Include(x => x.AdminParticipant.Participant)
                .Where(x => x.TripId == tripId && x.AdminParticipant.AdminId == CurrentUser.UserId)
                .ToListAsync();
        }
        if (CurrentUser.IsParticipant)
        {
            return await _dbSet
                .Include(x => x.AdminParticipant.Participant)
                .Where(x => x.TripId == tripId && x.AdminParticipant.AdminId == CurrentUser.AdminId)
                .ToListAsync();
        }

        return Array.Empty<TripUser>();
    }

    public virtual async Task AddAsync(TripUser entity)
    {
        if (CurrentUser == null || CurrentUser.IsParticipant)
        {
            throw new InvalidOperationException("Access denied");
        }

        if (CurrentUser.IsAdmin)
        {
            var adminParticipant = await _context.AdminsParticipants
                .FirstOrDefaultAsync(x => x.Id == entity.AdminParticipantId && x.AdminId == CurrentUser.UserId);
            if (adminParticipant == null)
            {
                throw new InvalidOperationException("Admin Participant not found or access denied");
            }
        }
        entity.Id = Guid.NewGuid();
        _context.TripUsers.Add(entity);
        await _context.SaveChangesAsync();
    }

    public virtual async Task UpdateAsync(TripUser entity)
    {
        if (CurrentUser == null || CurrentUser.IsParticipant)
        {
            throw new InvalidOperationException("Access denied");
        }
        var existingEntity = await GetByIdAsync(entity.Id);
        if (existingEntity == null)
        {
            throw new InvalidOperationException("Trip user not found or access denied");
        }
        _context.TripUsers.Attach(entity);
        _context.Entry(entity).State = EntityState.Modified;
        await _context.SaveChangesAsync();
    }

    public virtual async Task DeleteAsync(Guid id)
    {
        if (CurrentUser == null || CurrentUser.IsParticipant)
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
