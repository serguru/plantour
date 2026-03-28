using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class AiTripPlanRepository(PlantourContext context) : GenericRepository<AiTripPlan>(context)
{
    public async Task<AiTripPlan?> GetByQuestionAsync(Guid userId, string question)
    {
        return await _dbSet
            .AsNoTracking()
            .FirstOrDefaultAsync(x =>
                x.UserId == userId &&
                x.Question.ToLower() == question.ToLower());
    }

    public async Task<IEnumerable<AiTripPlan>> GetAllMonthAsync(Guid userId)
    {
        var monthAgo = DateTime.SpecifyKind(DateTime.UtcNow.AddMonths(-1), DateTimeKind.Unspecified);
        return await _dbSet
            .AsNoTracking()
            .Where(x => x.UserId == userId && x.CreatedAt >= monthAgo)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();
    }
}