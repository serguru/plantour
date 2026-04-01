using AutoMapper;
using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;
using PlantourApi.Models;
using System.Linq.Expressions;

namespace plantour_server.Repositories;

public class TripActivityRepository(PlantourContext context) : GenericRepository<TripActivity>(context)
{
    public async Task<IEnumerable<TripActivity>> FindFullAsync(Expression<Func<TripActivity, bool>> predicate)
    {
        return await _dbSet
            .Include(x => x.TripUser)
            .Include(x => x.ItineraryPart)
            .Where(predicate).ToListAsync();
    }

    public async Task<int> CountPersonalAsync(Guid adminId, Guid userId, Guid tripId)
    {
        return await _dbSet.CountAsync(x =>
            x.TripId == tripId &&
            x.TripUserId != null &&
            x.Trip.UserId == adminId &&
            x.TripUser != null &&
            x.TripUser.AdminParticipant.AdminId == adminId &&
            x.TripUser.AdminParticipant.ParticipantId == userId);
    }

    public async Task<int> CountPublicAsync(Guid tripId)
    {
        return await _dbSet.CountAsync(x => x.TripId == tripId && x.TripUserId == null);
    }
}
