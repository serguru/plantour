using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class TripUserRepository(PlantourContext context) : GenericRepository<TripUser>(context)
{

    public async Task<TripUser?> GetByTripIdAsync(Guid adminId, Guid userId, Guid tripId)
    {
        return await _dbSet
            .Include(x => x.AdminParticipant.Participant)
            .Include(x => x.TripUserPackages)
            .Include(x => x.TripUserThings)
            .Include(x => x.TripSharedThings)
            .FirstOrDefaultAsync(x =>
                x.TripId == tripId &&
                x.Trip.UserId == adminId &&
                x.AdminParticipant.AdminId == adminId &&
                x.AdminParticipant.ParticipantId == userId
                );
    }

    public async Task<TripUser?> GetByIdAsync(Guid adminId, Guid userId, Guid tripId, Guid id)
    {
        return await _dbSet
            .Include(x => x.AdminParticipant.Participant)
            .Include(x => x.TripUserPackages)
            .Include(x => x.TripUserThings)
            .Include(x => x.TripSharedThings)
            .FirstOrDefaultAsync(x =>
            x.Id == id &&
            x.AdminParticipant.AdminId == adminId &&
            x.AdminParticipant.ParticipantId == userId &&
            x.TripId == tripId
            );
    }

    public async Task<TripUser?> GetByIdForAllAsync(Guid adminId, Guid tripId, Guid id)
    {
        return await _dbSet
            .Include(x => x.AdminParticipant.Participant)
            .Include(x => x.TripUserPackages)
            .Include(x => x.TripUserThings)
            .Include(x => x.TripSharedThings)
            .FirstOrDefaultAsync(x =>
            x.Id == id &&
            x.AdminParticipant.AdminId == adminId &&
            x.TripId == tripId
            );
    }

    public async Task<bool> AnyByIdAsync(Guid adminId, Guid tripId, Guid id)
    {
        return await _dbSet
            .AnyAsync(x =>
            x.Id == id &&
            x.AdminParticipant.AdminId == adminId &&
            x.TripId == tripId
            );
    }

    public async Task<IEnumerable<TripUser>> GetAllAsync(Guid adminId, Guid tripId)
    {
        return await _dbSet
            .Include(x => x.AdminParticipant.Participant)
            .Include(x => x.TripUserPackages)
            .Include(x => x.TripUserThings)
            .Include(x => x.TripSharedThings)
            .Where(x => x.TripId == tripId && x.AdminParticipant.AdminId == adminId)
            .ToListAsync();
    }

    public async Task<int> CountAsync(Guid adminId, Guid tripId)
    {
        return await _dbSet.CountAsync(x => x.TripId == tripId && x.AdminParticipant.AdminId == adminId);
    }

}
