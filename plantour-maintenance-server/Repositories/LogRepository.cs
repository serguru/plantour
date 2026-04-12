using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_maintenance_server.Repositories;

public sealed class LogRepository(PlantourContext context)
{
    private readonly PlantourContext _context = context;

    public async Task<IReadOnlyList<LogRecord>> GetAsync(
        DateTimeOffset from,
        DateTimeOffset to,
        CancellationToken cancellationToken = default)
    {
        var fromUtc = from.UtcDateTime;
        var toInclusiveUtc = to.UtcDateTime;

        return await _context.Logs
            .AsNoTracking()
            .Where(log => log.TimeStamp >= fromUtc && log.TimeStamp <= toInclusiveUtc)
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