using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class TripUserExpenseRepository(PlantourContext context) : GenericRepository<TripUserExpense>(context)
{
    public async Task<TripUserExpense?> GetByIdAsync(Guid adminId, Guid userId, Guid tripId, Guid id)
    {
        return await _dbSet
            .Include(x => x.Currency)
            .Include(x => x.Recipient)
                .ThenInclude(x => x != null ? x.AdminParticipant.Participant : null)
            .Include(x => x.TripSharedExpenses)
            .Include(x => x.TripUser)
                .ThenInclude(x => x.Trip)
                    .ThenInclude(x => x.Currency)
            .Include(x => x.TripUser)
                .ThenInclude(x => x.AdminParticipant.Participant)
            .FirstOrDefaultAsync(x =>
                x.Id == id &&
                x.TripUser.Trip.Id == tripId &&
                x.TripUser.Trip.UserId == adminId &&
                x.TripUser.AdminParticipant.AdminId == adminId &&
                x.TripUser.AdminParticipant.ParticipantId == userId);
    }

    public async Task<TripUserExpense?> GetByIdWithSharedDetailsAsync(Guid adminId, Guid userId, Guid tripId, Guid id)
    {
        return await _dbSet
            .Include(x => x.Currency)
            .Include(x => x.Recipient)
                .ThenInclude(x => x != null ? x.AdminParticipant.Participant : null)
            .Include(x => x.TripSharedExpenses)
                .ThenInclude(x => x.AssignedTo)
                .ThenInclude(x => x != null ? x.AdminParticipant.Participant : null)
            .Include(x => x.TripUser)
                .ThenInclude(x => x.Trip)
                    .ThenInclude(x => x.Currency)
            .Include(x => x.TripUser)
                .ThenInclude(x => x.AdminParticipant.Participant)
            .FirstOrDefaultAsync(x =>
                x.Id == id &&
                x.TripUser.Trip.Id == tripId &&
                x.TripUser.Trip.UserId == adminId &&
                x.TripUser.AdminParticipant.AdminId == adminId &&
                x.TripUser.AdminParticipant.ParticipantId == userId);
    }

    public async Task<IEnumerable<TripUserExpense>> GetAllAsync(Guid adminId, Guid userId, Guid tripId)
    {
        return await _dbSet
            .AsNoTracking()
            .Include(x => x.Currency)
            .Include(x => x.Recipient)
                .ThenInclude(x => x != null ? x.AdminParticipant.Participant : null)
            .Include(x => x.TripSharedExpenses)
            .Include(x => x.TripUser)
                .ThenInclude(x => x.Trip)
                    .ThenInclude(x => x.Currency)
            .Include(x => x.TripUser)
                .ThenInclude(x => x.AdminParticipant.Participant)
            .Where(x =>
                x.TripUser.Trip.Id == tripId &&
                x.TripUser.Trip.UserId == adminId &&
                x.TripUser.AdminParticipant.AdminId == adminId &&
                x.TripUser.AdminParticipant.ParticipantId == userId)
            .ToListAsync();
    }

    public async Task<IEnumerable<TripUserExpense>> GetAllForTripAsync(Guid adminId, Guid tripId)
    {
        return await _dbSet
            .AsNoTracking()
            .Include(x => x.Currency)
            .Include(x => x.Recipient)
                .ThenInclude(x => x != null ? x.AdminParticipant.Participant : null)
            .Include(x => x.TripSharedExpenses)
            .Include(x => x.TripUser)
                .ThenInclude(x => x.Trip)
                    .ThenInclude(x => x.Currency)
            .Include(x => x.TripUser)
                .ThenInclude(x => x.AdminParticipant.Participant)
            .Where(x => x.TripUser.TripId == tripId && x.TripUser.AdminParticipant.AdminId == adminId)
            .ToListAsync();
    }

    public async Task<bool> AnyByIdAsync(Guid adminId, Guid userId, Guid tripId, Guid id)
    {
        return await _dbSet.AnyAsync(x =>
            x.Id == id &&
            x.TripUser.Trip.Id == tripId &&
            x.TripUser.Trip.UserId == adminId &&
            x.TripUser.AdminParticipant.AdminId == adminId &&
            x.TripUser.AdminParticipant.ParticipantId == userId);
    }
}