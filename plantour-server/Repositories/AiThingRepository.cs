using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class AiRepository(PlantourContext context) : GenericRepository<AiThing>(context)
{
    public async Task AddRangeAsync(IEnumerable<AiThing> things)
    {
        await _dbSet.AddRangeAsync(things);
        await _context.SaveChangesAsync();
    }
    
}
