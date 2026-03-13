using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class UsersRepository(PlantourContext context) : GenericRepository<User>(context)
{

    public async Task<bool> ActiveUserExistsByIdAsync(Guid userId)
    {
        return await _dbSet
        .Include(x => x.AccessType)
        .AnyAsync(u => u.Id == userId && u.AccessType != null && u.AccessType.Name.ToLower() == "active");
    }

    public async Task<User?> GetActiveByIdAsync(Guid id)
    {
        return await _dbSet
            .Include(x => x.AccessType)
            .FirstOrDefaultAsync(x => x.Id == id && x.AccessType != null && x.AccessType.Name.ToLower() == "active");
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _dbSet
            .Include(x => x.AccessType)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
    }

    public async Task<User?> GetActiveByEmailAsync(string email)
    {
        var user = await GetByEmailAsync(email);
        if (user != null && user.AccessType != null && user.AccessType.Name.ToLower() == "active")
        {
            return user;
        }
        return null;
    }

    public async Task<User?> GetByIdWithDetailsAsync(Guid userId)
    {
        return await _dbSet
            .AsNoTracking()
            .Include(x => x.AccessType)
            // .Include(x => x.PriceEnum)
            //     .ThenInclude(x => x != null ? x.Plan : null)
            .FirstOrDefaultAsync(u => u.Id == userId);
    }

    public async Task<User?> GetByGoogleSubAsync(string googleSub)
    {
        return await _dbSet
            .AsNoTracking()
            .Include(x => x.AccessType)
            // .Include(x => x.PriceEnum)
            //     .ThenInclude(x => x != null ? x.Plan : null)
            .FirstOrDefaultAsync(u => u.GoogleSub != null && u.GoogleSub == googleSub);
    }

    public async Task<User?> GetByFacebookUserIdAsync(string facebookUserId)
    {
        return await _dbSet
            .AsNoTracking()
            .Include(x => x.AccessType)
            // .Include(x => x.PriceEnum)
            //     .ThenInclude(x => x != null ? x.Plan : null)
            .FirstOrDefaultAsync(u => u.FacebookUserId != null && u.FacebookUserId == facebookUserId);
    }

}
