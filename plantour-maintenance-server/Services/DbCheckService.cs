using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;
using plantour_maintenance_server.Middleware;
using plantour_maintenance_server.Services.Interfaces;

namespace plantour_maintenance_server.Services;

public sealed class DbCheckService(PlantourContext context) : IDbCheckService
{
    private readonly PlantourContext _context = context;

    public async Task CheckAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var canConnect = await _context.Database.CanConnectAsync(cancellationToken);
            if (!canConnect)
            {
                throw new ServiceUnavailableException("Plantour database is unavailable.", "DB_UNAVAILABLE");
            }
        }
        catch (ServiceUnavailableException)
        {
            throw;
        }
        catch (Exception)
        {
            throw new ServiceUnavailableException("Plantour database is unavailable.", "DB_UNAVAILABLE");
        }
    }
}