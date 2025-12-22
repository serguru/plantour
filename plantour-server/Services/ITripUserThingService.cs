using plantour_server.DTOs;

namespace plantour_server.Services;

public interface ITripUserThingService
{
    Task<IEnumerable<TripThingDto>> GetAllAsync(Guid tripId);
    Task<TripThingDto?> GetByIdAsync(Guid id);
    Task<TripThingDto> AddAsync(CreateTripUserThingRequest request);
    Task<bool> UpdateAsync(UpdateTripUserThingRequest request);
    Task<bool> DeleteAsync(Guid id);
    Task<int> InsertTripUserThingsAsync(Guid tripId, Guid[] packageIds);
    Task<int> DeleteTripUserThingsAsync(Guid tripId, Guid[] packageIds);
    Task<int> PackTripThingsAsync(Guid tripId, Guid packageId, Guid[] tripThingIds);
    Task<int> UnpackTripThingsAsync(Guid tripId, Guid packageId, Guid[] tripThingIds);
    Task<int> InsertThingAssignmentsAsync(Guid tripId, DateTimeOffset deadline, Guid[] tripThingIds);
    Task<int> DeleteThingAssignmentsAsync(Guid tripId, Guid[] tripThingIds);
}
