using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class ContactSubmissionRepository(PlantourContext context) : GenericRepository<ContactSubmission>(context)
{
    public async Task<IEnumerable<ContactSubmission>> GetByStatusAsync(string status)
    {
        return await _dbSet
            .AsNoTracking()
            .Where(x => x.ContactStatus == status)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<ContactSubmission>> GetByEmailAsync(string email)
    {
        return await _dbSet
            .AsNoTracking()
            .Where(x => x.Email.ToLower() == email.ToLower())
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<ContactSubmission>> GetAllRecentAsync(int days = 30)
    {
        var cutoffDate = DateTime.SpecifyKind(DateTime.UtcNow.AddDays(-days), DateTimeKind.Unspecified);
        return await _dbSet
            .AsNoTracking()
            .Where(x => x.CreatedAt >= cutoffDate)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();
    }
}
