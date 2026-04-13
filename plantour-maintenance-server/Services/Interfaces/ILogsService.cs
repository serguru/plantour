using plantour_maintenance_server.DTOs;

namespace plantour_maintenance_server.Services.Interfaces;

public interface ILogsService
{
    Task<IReadOnlyList<LogRowDto>> GetAsync(
        DateTimeOffset? from = null,
        DateTimeOffset? to = null,
        CancellationToken cancellationToken = default);
}