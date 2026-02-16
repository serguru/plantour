using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class UsersRepository(PlantourContext context) : GenericRepository<User>(context)
{
    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _dbSet
            .Include(x => x.AccessType)
            .Include(x => x.Plan)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
    }

    public async Task<User?> GetByIdWithDetailsAsync(Guid userId)
    {
        return await _dbSet
            .Include(x => x.AccessType)
            .Include(x => x.Plan)
            .FirstOrDefaultAsync(u => u.Id == userId);
    }

    public async Task<User?> GetByStripeCustomerIdAsync(string stripeCustomerId)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.StripeCustomerId == stripeCustomerId);
    }

    public async Task<User?> GetByStripeCustomerIdWithSubscriptionsAsync(string stripeCustomerId)
    {
        return await _context.Users
            .Include(u => u.CustomerSubscriptions)
            .FirstOrDefaultAsync(u => u.StripeCustomerId == stripeCustomerId);
    }


}
