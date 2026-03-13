using plantour_server.DTOs;

namespace plantour_server.Services;

public interface ITripSharedTodoService
{
    Task<IEnumerable<TripSharedTodoDto>> GetAllFullAsync(Guid tripId);
    Task<IEnumerable<TripSharedTodoDto>> GetAllForAssigneeAsync(Guid tripId, Guid assigneeId);
    Task<TripSharedTodoDto?> GetByIdAsync(Guid tripId, Guid id);
    Task<TripSharedTodoDto> AddAsync(CreateTripSharedTodoRequest request);
    Task UpdateAsync(UpdateTripSharedTodoRequest request);
    Task DeleteAsync(Guid tripId, Guid id);
    Task<int> InsertTripSharedTodosAsync(Guid tripId, Guid[] ids);
    Task<int> DeleteTripSharedTodosAsync(Guid tripId, Guid[] ids);
    Task<int> AssignTripSharedTodosAsync(MultipleIdsAssignRequest request);
    Task<int> UnassignTripSharedTodosAsync(Guid tripId, Guid[] ids);
    Task ToggleAcceptAssignmentAsync(Guid tripId, Guid id);
    Task ToggleRejectAssignmentAsync(Guid tripId, Guid id);
}