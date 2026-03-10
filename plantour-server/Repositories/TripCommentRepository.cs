using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class TripCommentRepository(PlantourContext context) : GenericRepository<TripComment>(context)
{
    public async Task<TripComment?> GetByIdAsync(Guid adminId, Guid userId, Guid tripId, Guid id)
    {
        return await _dbSet
            .Include(x => x.TripUser!)
                .ThenInclude(tu => tu.AdminParticipant!)
                    .ThenInclude(ap => ap.Participant)
            .FirstOrDefaultAsync(x =>
                x.Id == id &&
                x.Trip != null &&
                x.Trip.Id == tripId &&
                x.Trip.UserId == adminId &&
                x.Trip.TripUsers.Any(tu =>
                    tu.AdminParticipant != null &&
                    tu.AdminParticipant.AdminId == adminId &&
                    tu.AdminParticipant.ParticipantId == userId)
                );

    }

    public async Task<bool> AnyByIdAsync(Guid adminId, Guid userId, Guid tripId, Guid id)
    {
        return await _dbSet
            .AnyAsync(x =>
                x.Id == id &&
                x.Trip != null &&
                x.Trip.Id == tripId &&
                x.Trip.UserId == adminId &&
                x.Trip.TripUsers.Any(tu =>
                    tu.AdminParticipant != null &&
                    tu.AdminParticipant.AdminId == adminId &&
                    tu.AdminParticipant.ParticipantId == userId)
                );
    }

    public async Task<IEnumerable<TripComment>> GetAllAsync(Guid adminId, Guid userId, Guid tripId)
    {
        return await _dbSet
            .Include(x => x.Trip)
                .ThenInclude(y => y.User)
            .Include(x => x.TripUser)
                .ThenInclude(tu => tu != null ? tu.AdminParticipant! : null)
                    .ThenInclude(ap => ap != null ? ap.Participant : null)

            .Include(x => x.TripUser)
                .ThenInclude(tu => tu != null ? tu.AdminParticipant! : null)
                    .ThenInclude(ap => ap != null ? ap.Admin : null)
            .Where(x =>
                x.Trip != null &&
                x.Trip.Id == tripId &&
                x.Trip.UserId == adminId &&
                (
                    x.TripUser == null ||
                    x.Trip.TripUsers.Any(tu =>
                        tu.AdminParticipant != null &&
                        tu.AdminParticipant.AdminId == adminId &&
                        tu.AdminParticipant.ParticipantId == userId
                ))
                )
            .ToListAsync();
    }

}

