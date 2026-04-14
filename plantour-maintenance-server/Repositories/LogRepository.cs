using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_maintenance_server.Repositories;

public sealed class LogRepository(PlantourContext context)
{
    private readonly PlantourContext _context = context;

    public async Task<IReadOnlyList<LogRecord>> GetAsync(
        DateTimeOffset? from = null,
        DateTimeOffset? to = null,
        CancellationToken cancellationToken = default)
    {
        var logsQuery = _context.Logs
            .AsNoTracking()
            .AsQueryable();

        if (from.HasValue && to.HasValue)
        {
            var fromUtc = from.Value.UtcDateTime;
            var toInclusiveUtc = to.Value.UtcDateTime;
            logsQuery = logsQuery.Where(log => log.CreatedAt >= fromUtc && log.CreatedAt <= toInclusiveUtc);
        }

        return await logsQuery
            .OrderByDescending(log => log.CreatedAt)
            .ThenByDescending(log => log.Id)
            .Select(log => new LogRecord(
                log.Id,
                log.CreatedAt,
                log.Severity,
                log.Category ?? string.Empty,
                log.Message,
                log.UserId,
                log.Properties))
            .ToListAsync(cancellationToken);
    }
}

public sealed record LogRecord(
    Guid Id,
    DateTime CreatedAt,
    string Severity,
    string Category,
    string Message,
    Guid? UserId,
    string? Properties);