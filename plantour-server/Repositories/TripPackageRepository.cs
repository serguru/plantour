using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class TripPackRepository(PlantourContext context) : GenericRepository<TripPack>(context)
{

    public async Task<TripPack?> GetByIdAsync(Guid adminId, Guid userId, Guid tripId, Guid id)
    {
        return await _dbSet
            .FirstOrDefaultAsync(x =>
                x.Id == id &&
                x.TripUser.Trip.Id == tripId &&
                x.TripUser.Trip.UserId == adminId &&
                x.TripUser.AdminParticipant.AdminId == adminId &&
                x.TripUser.AdminParticipant.ParticipantId == userId);
    }

    public async Task<bool> AnyByIdAsync(Guid adminId, Guid userId, Guid tripId, Guid id)
    {
        return await _dbSet
            .AnyAsync(x =>
                x.Id == id &&
                x.TripUser.Trip.Id == tripId &&
                x.TripUser.Trip.UserId == adminId &&
                x.TripUser.AdminParticipant.AdminId == adminId &&
                x.TripUser.AdminParticipant.ParticipantId == userId);
    }

    public async Task<IEnumerable<TripPack>> GetAllAsync(Guid adminId, Guid userId, Guid tripId)
    {
        return await _dbSet
            .Where(x =>
                x.TripUser.Trip.Id == tripId &&
                x.TripUser.Trip.UserId == adminId &&
                x.TripUser.AdminParticipant.AdminId == adminId &&
                x.TripUser.AdminParticipant.ParticipantId == userId)
            .ToListAsync();
    }

}
