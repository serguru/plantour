using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class TripImprovementRepository(PlantourContext context) : GenericRepository<TripUserImprovement>(context)
{
    public async Task<TripUserImprovement?> GetByIdAsync(Guid adminId, Guid userId, Guid tripId, Guid id)
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

    public async Task<int> CountAsync(Guid adminId, Guid userId, Guid tripId)
    {
        return await _dbSet
            .CountAsync(x =>
                x.TripUser.Trip.Id == tripId &&
                x.TripUser.Trip.UserId == adminId &&
                x.TripUser.AdminParticipant.AdminId == adminId &&
                x.TripUser.AdminParticipant.ParticipantId == userId);
    }

    public async Task<IEnumerable<TripUserImprovement>> GetAllAsync(Guid adminId, Guid userId, Guid tripId)
    {
        return await _dbSet
            .AsNoTracking()
            .Where(x =>
                x.TripUser.Trip.Id == tripId &&
                x.TripUser.Trip.UserId == adminId &&
                x.TripUser.AdminParticipant.AdminId == adminId &&
                x.TripUser.AdminParticipant.ParticipantId == userId)
            .OrderBy(x => x.ImprovementOrder)
            .ToListAsync();
    }
}