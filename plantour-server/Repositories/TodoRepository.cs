using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class TodoRepository(PlantourContext context) : GenericRepository<UserTodo>(context)
{
    public async Task<UserTodo?> GetByIdAsync(Guid userId, Guid id)
    {
        return await _dbSet
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);
    }

    public async Task<int> CountAsync(Guid userId)
    {
        return await _dbSet.CountAsync(x => x.UserId == userId);
    }
}