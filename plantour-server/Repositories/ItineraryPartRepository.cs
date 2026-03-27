using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class ItineraryPartRepository(PlantourContext context) : GenericRepository<ItineraryPart>(context)
{
    public async Task<IEnumerable<ItineraryPart>> GetAllAsync(Guid adminId, Guid userId, Guid tripId)
    {
        return await _dbSet
            .AsNoTracking()
            .Where(x =>
                x.TripId == tripId &&
                x.Trip.UserId == adminId &&
                x.Trip.TripUsers.Any(tu =>
                    tu.AdminParticipant.AdminId == adminId &&
                    tu.AdminParticipant.ParticipantId == userId))
            .Include(x => x.TripUserTodos.Where(todo =>
                todo.TripUser.Trip.Id == tripId &&
                todo.TripUser.Trip.UserId == adminId &&
                todo.TripUser.AdminParticipant.AdminId == adminId &&
                todo.TripUser.AdminParticipant.ParticipantId == userId))
            .OrderBy(x => x.StartDate)
            .ThenBy(x => x.Name)
            .ToListAsync();
    }

    public async Task<ItineraryPart?> GetByIdAsync(Guid adminId, Guid userId, Guid tripId, Guid id)
    {
        return await _dbSet
            .AsNoTracking()
            .FirstOrDefaultAsync(x =>
                x.Id == id &&
                x.TripId == tripId &&
                x.Trip.UserId == adminId &&
                x.Trip.TripUsers.Any(tu =>
                    tu.AdminParticipant.AdminId == adminId &&
                    tu.AdminParticipant.ParticipantId == userId));
    }

    public async Task<bool> AnyAccessibleByIdAsync(Guid adminId, Guid userId, Guid tripId, Guid id)
    {
        return await _dbSet
            .AnyAsync(x =>
                x.Id == id &&
                x.TripId == tripId &&
                x.Trip.UserId == adminId &&
                x.Trip.TripUsers.Any(tu =>
                    tu.AdminParticipant.AdminId == adminId &&
                    tu.AdminParticipant.ParticipantId == userId));
    }
}