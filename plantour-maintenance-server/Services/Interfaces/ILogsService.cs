using plantour_maintenance_server.DTOs;

namespace plantour_maintenance_server.Services.Interfaces;

public interface ILogsService
{
    Task<IReadOnlyList<LogRowDto>> GetAsync(DateTimeOffset from, DateTimeOffset to, CancellationToken cancellationToken = default);
}