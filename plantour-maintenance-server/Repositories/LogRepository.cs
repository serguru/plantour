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
            logsQuery = logsQuery.Where(log => log.TimeStamp >= fromUtc && log.TimeStamp <= toInclusiveUtc);
        }

        return await logsQuery
            .OrderByDescending(log => log.TimeStamp)
            .ThenByDescending(log => log.Id)
            .Select(log => new LogRecord(
                log.Id,
                log.TimeStamp,
                log.Level,
                log.EventType,
                log.Subtype,
                log.MessageTemplate,
                log.Exception))
            .ToListAsync(cancellationToken);
    }
}

public sealed record LogRecord(
    int Id,
    DateTime TimeStamp,
    string? Level,
    string? EventType,
    string? Subtype,
    string? MessageTemplate,
    string? Exception);