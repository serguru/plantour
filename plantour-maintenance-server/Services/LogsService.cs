using plantour_maintenance_server.DTOs;
using plantour_maintenance_server.Repositories;
using plantour_maintenance_server.Services.Interfaces;

namespace plantour_maintenance_server.Services;

public sealed class LogsService(LogRepository logRepository) : ILogsService
{
    private readonly LogRepository _logRepository = logRepository;

    public async Task<IReadOnlyList<LogRowDto>> GetAsync(
        DateTimeOffset? from = null,
        DateTimeOffset? to = null,
        CancellationToken cancellationToken = default)
    {
        var rows = await _logRepository.GetAsync(from, to, cancellationToken);

        return rows
            .Select(log => new LogRowDto
            {
                Id = log.Id,
                CreatedAt = new DateTimeOffset(DateTime.SpecifyKind(log.CreatedAt, DateTimeKind.Utc)),
                Severity = log.Severity,
                Category = log.Category,
                Message = log.Message,
                UserId = log.UserId,
                Properties = log.Properties ?? string.Empty
            })
            .ToArray();
    }
}