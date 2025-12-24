using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class PackageRepository(PlantourContext context) : GenericRepository<UserPackage>(context)
{

    public async Task<UserPackage?> GetByIdAsync(Guid userId, Guid id)
    {
        return await _dbSet
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);
    }

    // public async Task<IEnumerable<UserPackage>> GetAllAsync(Guid userId)
    // {
    //     return await _dbSet
    //         .Where(x => x.UserId == userId)
    //         .ToListAsync();
    // }

    // public override async Task<UserPackage> AddAsync(UserPackage entity)
    // {
    //     var existingEntity = await GetByNameAsync(entity.UserId, entity.Name);
    //     if (existingEntity != null)
    //     {
    //         throw new InvalidOperationException("Package with the same description already exists");
    //     }
    //     entity.Id = Guid.NewGuid();
    //     _context.UserPackages.Add(entity);
    //     await _context.SaveChangesAsync();
    //     return entity;
    // }

    // public virtual async Task UpdateAsync(UserPackage entity)
    // {
    //     var existingEntity = await GetByIdAsync(entity.UserId, entity.Id);
    //     if (existingEntity == null || existingEntity.UserId != entity.UserId)
    //     {
    //         throw new InvalidOperationException("User package not found or access denied");
    //     }
    //     _context.UserPackages.Attach(entity);
    //     _context.Entry(entity).State = EntityState.Modified;
    //     await _context.SaveChangesAsync();
    // }
}
