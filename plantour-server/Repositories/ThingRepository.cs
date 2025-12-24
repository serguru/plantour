using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class ThingRepository(PlantourContext context) : GenericRepository<UserThing>(context)
{

    public async Task<UserThing?> GetByIdAsync(Guid userId, Guid id)
    {
        return await _dbSet
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);
    }

    // public async Task<UserThing?> GetByNameAsync(string name)
    // {
    //     if (CurrentUser == null)
    //     {
    //         return null;
    //     }
    //     return await _dbSet
    //         .FirstOrDefaultAsync(x => x.Name == name && x.UserId == CurrentUser.UserId);
    // }


    // public virtual async Task AddAsync(UserThing entity)
    // {
    //     if (CurrentUser == null)
    //     {
    //         throw new InvalidOperationException("Access denied");
    //     }
    //     var existingEntity = await GetByNameAsync(entity.Name);
    //     if (existingEntity != null)
    //     {
    //         throw new InvalidOperationException("Thing with the same description already exists");
    //     }
    //     entity.Id = Guid.NewGuid();
    //     entity.UserId = CurrentUser.UserId;
    //     _context.UserThings.Add(entity);
    //     await _context.SaveChangesAsync();
    // }

    // public virtual async Task UpdateAsync(UserThing entity)
    // {
    //     var existingEntity = await GetByIdAsync(entity.Id);
    //     if (existingEntity == null || existingEntity.UserId != CurrentUser!.UserId)
    //     {
    //         throw new InvalidOperationException("User thing not found or access denied");
    //     }
    //     entity.UserId = CurrentUser.UserId;
    //     _context.UserThings.Attach(entity);
    //     _context.Entry(entity).State = EntityState.Modified;
    //     await _context.SaveChangesAsync();
    // }

    // public virtual async Task DeleteAsync(Guid id)
    // {
    //     var entity = await GetByIdAsync(id);
    //     if (entity == null || entity.UserId != CurrentUser!.UserId)
    //     {
    //         return;
    //     }
    //     _context.UserThings.Remove(entity);
    //     await _context.SaveChangesAsync();
    // }
}
