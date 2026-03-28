using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class TripNoteRepository(PlantourContext context) : GenericRepository<TripNote>(context)
{
    public async Task<TripNote?> GetByIdAsync(Guid adminId, Guid userId, Guid tripId, Guid id)
    {
        return await _dbSet
            .Include(x => x.TripActivity)
            .FirstOrDefaultAsync(x =>
                x.Id == id &&
                x.TripUserId != null &&
                x.TripUser != null &&
                x.TripUser.TripId == tripId &&
                x.TripUser.Trip.UserId == adminId &&
                x.TripUser.AdminParticipant.AdminId == adminId &&
                x.TripUser.AdminParticipant.ParticipantId == userId);
    }

    public async Task<bool> AnyByIdAsync(Guid adminId, Guid userId, Guid tripId, Guid id)
    {
        return await _dbSet
            .AnyAsync(x =>
                x.Id == id &&
                x.TripUserId != null &&
                x.TripUser != null &&
                x.TripUser.TripId == tripId &&
                x.TripUser.Trip.UserId == adminId &&
                x.TripUser.AdminParticipant.AdminId == adminId &&
                x.TripUser.AdminParticipant.ParticipantId == userId);
    }

    public async Task<IEnumerable<TripNote>> GetAllAsync(Guid adminId, Guid userId, Guid tripId)
    {
        return await _dbSet
            .AsNoTracking()
            .Include(x => x.TripActivity)
            .Where(x =>
                x.TripUserId != null &&
                x.TripUser != null &&
                x.TripUser.TripId == tripId &&
                x.TripUser.Trip.UserId == adminId &&
                x.TripUser.AdminParticipant.AdminId == adminId &&
                x.TripUser.AdminParticipant.ParticipantId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .ThenBy(x => x.Title)
            .ToListAsync();
    }

    public async Task<List<TripNote>> GetByIdsAsync(Guid adminId, Guid userId, Guid tripId, Guid[] ids)
    {
        return await _dbSet
            .AsNoTracking()
            .Include(x => x.TripActivity)
            .Where(x =>
                ids.Contains(x.Id) &&
                x.TripUserId != null &&
                x.TripUser != null &&
                x.TripUser.TripId == tripId &&
                x.TripUser.Trip.UserId == adminId &&
                x.TripUser.AdminParticipant.AdminId == adminId &&
                x.TripUser.AdminParticipant.ParticipantId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .ThenBy(x => x.Title)
            .ToListAsync();
    }
}