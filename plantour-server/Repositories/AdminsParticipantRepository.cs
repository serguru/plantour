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
            .ThenInclude(x => x.AccessType)
        .Include(x => x.Admin)
            .ThenInclude(x => x.AccessType)
        .Where(predicate).ToListAsync();
    }

    public async Task<IEnumerable<AdminsParticipant>> FindFullBothActiveAsync(Expression<Func<AdminsParticipant, bool>> predicate)
    {
        return await _dbSet
            .Include(x => x.Participant)
                .ThenInclude(x => x.AccessType)
            .Include(x => x.Admin)
                .ThenInclude(x => x.AccessType)
            .Where(x =>
                x.Participant.AccessType.Name.ToLower() == "active" &&
                x.Admin.AccessType.Name.ToLower() == "active")
            .Where(predicate)
            .ToListAsync();
    }
}
