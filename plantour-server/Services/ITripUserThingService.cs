using plantour_server.DTOs;

namespace plantour_server.Services;

public interface ITripUserThingService
{
    Task<IEnumerable<TripUserThingDto>> GetAllAsync(Guid tripId);
    Task<TripUserThingDto?> GetByIdAsync(Guid id);
    Task<TripUserThingDto> AddAsync(CreateTripUserThingRequest request);
    Task<bool> UpdateAsync(UpdateTripUserThingRequest request);
    Task<bool> DeleteAsync(Guid id);
    Task<int> InsertTripUserThingsAsync(Guid tripId, Guid[] packageIds);
    Task<int> DeleteTripUserThingsAsync(Guid tripId, Guid[] packageIds);
    Task<int> PackTripThingsAsync(Guid tripId, Guid packageId, Guid[] tripThingIds);
    Task<int> UnpackTripThingsAsync(Guid tripId, Guid packageId, Guid[] tripThingIds);
}
