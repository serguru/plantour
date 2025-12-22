using plantour_server.DTOs;

namespace plantour_server.Services;

public interface ITripThingService
{
    Task<IEnumerable<TripThingDto>> GetAllAsync(Guid tripId);
    Task<TripThingDto?> GetByIdAsync(Guid tripId,Guid id);
    Task<TripThingDto> AddAsync(CreateTripUserThingRequest request);
    Task<bool> UpdateAsync(UpdateTripUserThingRequest request);
    Task<bool> DeleteAsync(Guid tripId,Guid id);
    Task<int> InsertTripUserThingsAsync(Guid tripId, Guid[] packageIds);
    Task<int> DeleteTripUserThingsAsync(Guid tripId, Guid[] packageIds);
    Task<int> PackTripThingsAsync(Guid tripId, Guid packageId, Guid[] tripThingIds);
    Task<int> UnpackTripThingsAsync(Guid tripId, Guid packageId, Guid[] tripThingIds);
}
