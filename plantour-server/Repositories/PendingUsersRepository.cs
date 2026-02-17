using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class PendingUsersRepository(PlantourContext context) : GenericRepository<PendingUser>(context)
{
    public async Task<PendingUser?> GetByCheckoutSessionIdAsync(string id)
    {
        return await _dbSet
            .FirstOrDefaultAsync(u => u.CheckoutSessionId == id);
    }

}
