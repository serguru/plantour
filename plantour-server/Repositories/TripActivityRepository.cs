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
}
