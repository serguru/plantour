using plantour_server.DTOs;

namespace plantour_server.Services;

public interface ITripSharedExpenseService
{
    Task<IEnumerable<TripSharedExpenseDto>> GetAllFullAsync(Guid tripId);
    Task<IEnumerable<TripSharedExpenseDto>> GetAllForAssigneeAsync(Guid tripId, Guid assigneeId);
    Task<TripSharedExpenseDto?> GetByIdAsync(Guid tripId, Guid id);
    Task<TripSharedExpenseDto> AddAsync(CreateTripSharedExpenseRequest request);
    Task UpdateAsync(UpdateTripSharedExpenseRequest request);
    Task DeleteAsync(Guid tripId, Guid id);
    Task<int> AssignTripSharedExpensesAsync(MultipleIdsAssignRequest request);
    Task<int> UnassignTripSharedExpensesAsync(Guid tripId, Guid[] ids);
    Task ToggleAcceptAssignmentAsync(Guid tripId, Guid id);
    Task ToggleRejectAssignmentAsync(Guid tripId, Guid id);
}