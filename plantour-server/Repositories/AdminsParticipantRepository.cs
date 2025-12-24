using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class AdminsParticipantRepository(PlantourContext context) : GenericRepository<AdminsParticipant>(context)
{
    public async Task<IEnumerable<AdminsParticipant>> FindFullAsync(Expression<Func<AdminsParticipant, bool>> predicate)
    {
        return await _dbSet
        .Include(x => x.Participant)
        .Include(x => x.Admin)
        .Where(predicate).ToListAsync();
    }
}
