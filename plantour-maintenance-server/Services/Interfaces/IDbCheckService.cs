namespace plantour_maintenance_server.Services.Interfaces;

public interface IDbCheckService
{
    Task CheckAsync(CancellationToken cancellationToken = default);
}