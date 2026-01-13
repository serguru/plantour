using plantour_server.DTOs;

namespace plantour_server.Services;

public interface ITripThingService
{
    Task<IEnumerable<TripThingDto>> GetAllAsync(Guid tripId);
    Task<IEnumerable<TripThingDto>> GetAllForPackageAsync(Guid tripId, Guid packageId);
    Task<TripThingDto?> GetByIdAsync(Guid tripId,Guid id);
    Task<TripThingDto> AddAsync(CreateTripThingRequest request);
    Task UpdateAsync(UpdateTripThingRequest request);
    Task DeleteAsync(Guid tripId,Guid id);
    Task<int> InsertTripUserThingsAsync(Guid tripId, Guid[] packageIds);
    Task<int> DeleteTripUserThingsAsync(Guid tripId, Guid[] packageIds);
    Task<int> PackTripThingsAsync(Guid tripId, Guid packageId, Guid[] tripThingIds);
    Task<int> UnpackTripThingsAsync(Guid tripId, Guid[] tripThingIds);
    Task<int> InsertTemplateTripUserThingsAsync(Guid tripId, Guid[] ids);
    Task<int> DeleteTemplateTripUserThingsAsync(Guid tripId, Guid[] ids);
}
