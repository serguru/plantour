using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class CustomerSubscriptionRepository(PlantourContext context) : GenericRepository<CustomerSubscription>(context)
{

    public virtual async Task<CustomerSubscription?> GetByStripeIdAsync(string id)
    {
        return await _dbSet.FirstOrDefaultAsync(x => x.StripeSubscriptionId == id);
    }


    public async Task<IEnumerable<CustomerSubscription>> GetAllForUserAsync(Guid userId)
    {
        return await _dbSet
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();
    }
}
