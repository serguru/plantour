using plantour_server.DTOs;

namespace plantour_server.Services;

public interface ITripSharedService
{
    Task<IEnumerable<TripSharedDto>> GetAllFullAsync(Guid tripId);
    Task<IEnumerable<TripSharedDto>> GetAllForAssigneeAsync(Guid tripId, Guid assigneeId);
    Task<TripSharedDto?> GetByIdAsync(Guid tripId, Guid id);
    Task<TripSharedDto> AddAsync(CreateTripSharedRequest request);
    Task UpdateAsync(UpdateTripSharedRequest request);
    Task DeleteAsync(Guid tripId, Guid id);
    Task<int> InsertTripSharedsAsync(Guid tripId, Guid[] thingIds);
    Task<int> DeleteTripSharedsAsync(Guid tripId, Guid[] thingIds);
    Task<int> InsertTemplateTripSharedThingsAsync(Guid tripId, Guid[] ids);
    Task<int> DeleteTemplateTripSharedThingsAsync(Guid tripId, Guid[] ids);
    Task<int> AssignTripSharedThingsAsync(MultipleIdsAssignRequest request);
    Task<int> UnassignTripSharedThingsAsync(Guid tripId, Guid[] ids);
    Task ToggleAcceptAssignmentAsync(Guid tripId, Guid id);
    Task ToggleRejectAssignmentAsync(Guid tripId, Guid id);
}
