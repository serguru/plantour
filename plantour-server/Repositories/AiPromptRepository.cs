using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class AiPromptRepository(PlantourContext context) : GenericRepository<AiPrompt>(context)
{
    public async Task<AiPrompt?> GetByIdAsync(Guid userId, Guid id)
    {
        return await _dbSet
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);
    }
    public async Task<AiPrompt?> GetByPromptAsync(Guid userId, string prompt)
    {
        return await _dbSet
            .AsNoTracking()
            .FirstOrDefaultAsync(x => 
            x.Prompt.ToLower() == prompt.ToLower() && 
            x.UserId == userId
            );
    }

    public async Task<IEnumerable<AiPrompt>> GetAllMonthAsync(Guid userId)
    {
        var monthAgo = DateTime.SpecifyKind(DateTime.UtcNow.AddMonths(-1), DateTimeKind.Unspecified);
        return await _dbSet
            .AsNoTracking()
            .Where(x => 
            x.UserId == userId &&
            x.CreatedAt >= monthAgo
            )
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();
    }

}
