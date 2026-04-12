using plantour_maintenance_server.DTOs;
using plantour_maintenance_server.Middleware;
using plantour_maintenance_server.Repositories;
using plantour_maintenance_server.Services.Interfaces;

namespace plantour_maintenance_server.Services;

public sealed class LogsService(LogRepository logRepository) : ILogsService
{
    private readonly LogRepository _logRepository = logRepository;

    public async Task<IReadOnlyList<LogRowDto>> GetAsync(
        DateTimeOffset from,
        DateTimeOffset to,
        CancellationToken cancellationToken = default)
    {
        if (from > to)
        {
            throw new BadRequestException("The from datetime must be earlier than or equal to the to datetime.", "INVALID_DATE_RANGE");
        }

        var rows = await _logRepository.GetAsync(from, to, cancellationToken);

        return rows
            .Select(log => new LogRowDto
            {
                Id = log.Id,
                TimeStamp = new DateTimeOffset(DateTime.SpecifyKind(log.TimeStamp, DateTimeKind.Utc)),
                Level = log.Level,
                EventType = log.EventType,
                Subtype = log.Subtype,
                MessageTemplate = log.MessageTemplate,
                Exception = log.Exception
            })
            .ToArray();
    }
}