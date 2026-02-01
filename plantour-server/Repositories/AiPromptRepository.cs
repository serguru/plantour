using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class AiPromptRepository(PlantourContext context) : GenericRepository<AiPrompt>(context)
{
    public async Task<AiPrompt?> GetByIdAsync(Guid userId, Guid id)
    {
        return await _dbSet
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);
    }
    public async Task<AiPrompt?> GetByPromptMonthAsync(Guid userId, string prompt)
    {
        return await _dbSet
            .FirstOrDefaultAsync(x => 
            x.Prompt.ToLower() == prompt.ToLower() && 
            x.UserId == userId &&
            x.CreatedAt >= DateTime.UtcNow.AddMonths(-1)
            );
    }

    public async Task<IEnumerable<AiPrompt>> GetAllMonthAsync(Guid userId)
    {
        return await _dbSet
            .Where(x => 
            x.UserId == userId &&
            x.CreatedAt >= DateTime.UtcNow.AddMonths(-1)
            )
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();
    }

}
