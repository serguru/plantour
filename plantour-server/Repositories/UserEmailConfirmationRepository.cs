using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class UserEmailConfirmationRepository(PlantourContext context) : GenericRepository<UserEmailConfirmation>(context)
{
    public async Task<UserEmailConfirmation?> GetByUserIdAsync(Guid userId)
    {
        return await _dbSet.FirstOrDefaultAsync(x => x.UserId == userId);
    }
}
