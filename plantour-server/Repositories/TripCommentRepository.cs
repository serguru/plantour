using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class TripCommentRepository(PlantourContext context) : GenericRepository<TripComment>(context)
{
    public async Task<TripComment?> GetByIdAsync(Guid adminId, Guid userId, Guid tripId, Guid id)
    {
        return await _dbSet
            .Include(x => x.TripUser)
            .FirstOrDefaultAsync(x =>
                x.Id == id &&
                x.Trip.Id == tripId &&
                x.Trip.UserId == adminId &&
                x.Trip.TripUsers.Any(tu =>
                    tu.AdminParticipant.AdminId == adminId &&
                    tu.AdminParticipant.ParticipantId == userId)
                );

    }

    public async Task<bool> AnyByIdAsync(Guid adminId, Guid userId, Guid tripId, Guid id)
    {
        return await _dbSet
            .AnyAsync(x =>
                x.Id == id &&
                x.Trip.Id == tripId &&
                x.Trip.UserId == adminId &&
                x.Trip.TripUsers.Any(tu =>
                    tu.AdminParticipant.AdminId == adminId &&
                    tu.AdminParticipant.ParticipantId == userId)
                );
    }

    public async Task<IEnumerable<TripComment>> GetAllAsync(Guid adminId, Guid userId, Guid tripId)
    {
        return await _dbSet
            .Include(x => x.TripUser)
            .Where(x =>
                x.Trip.Id == tripId &&
                x.Trip.UserId == adminId &&
                x.Trip.TripUsers.Any(tu =>
                    tu.AdminParticipant.AdminId == adminId &&
                    tu.AdminParticipant.ParticipantId == userId
                ))
            .ToListAsync();
    }

}
