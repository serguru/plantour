using plantour_server.DTOs;

namespace plantour_server.Services;

public interface ITripSharedService
{
    Task<IEnumerable<TripSharedDto>> GetAllFullAsync(Guid tripId);
    Task<TripThingDto?> GetByIdAsync(Guid tripId, Guid id);
    Task<TripThingDto> AddAsync(CreateTripSharedRequest request);
    Task<bool> UpdateAsync(UpdateTripSharedRequest request);
    Task<bool> DeleteAsync(Guid tripId, Guid id);
    Task<int> InsertTripSharedsAsync(Guid tripId, Guid[] packageIds);
    Task<int> DeleteTripSharedsAsync(Guid tripId, Guid[] packageIds);
}
