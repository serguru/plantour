using plantour_server.DTOs;

namespace plantour_server.Services;

public interface ITripUserThingService
{
    Task<IEnumerable<TripUserThingDto>> GetAllAsync(Guid tripId);
    Task<TripUserThingDto?> GetByIdAsync(Guid id);
    Task<TripUserThingDto> AddAsync(CreateTripUserThingRequest request);
    Task<bool> UpdateAsync(UpdateTripUserThingRequest request);
    Task<bool> DeleteAsync(Guid id);
}
