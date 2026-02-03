using plantour_server.DTOs;

namespace plantour_server.Services;

public interface IDashboardService
{
    Task<DashboardTripDto?> GetDashboardTripDtoAsync(Guid? tripId);
}
