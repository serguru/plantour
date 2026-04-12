using plantour_maintenance_server.DTOs;

namespace plantour_maintenance_server.Services.Interfaces;

public interface IVisitorActivityService
{
    Task<IReadOnlyList<VisitorActivityRowDto>> GetAsync(DateTimeOffset from, DateTimeOffset to, CancellationToken cancellationToken = default);
}