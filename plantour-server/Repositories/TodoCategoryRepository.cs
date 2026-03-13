using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class TodoCategoryRepository(PlantourContext context) : GenericRepository<TodoCategory>(context)
{
    public override async Task<IEnumerable<TodoCategory>> GetAllAsync()
    {
        return await _dbSet
            .AsNoTracking()
            .ToListAsync();
    }
}