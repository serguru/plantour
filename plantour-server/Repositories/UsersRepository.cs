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
}
