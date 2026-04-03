using plantour_server.DTOs;

namespace plantour_server.Services;

public interface ITripSharedExpenseService
{
    Task<IEnumerable<TripSharedExpenseDto>> GetAllFullAsync(Guid tripId);
    Task<TripSharedExpenseDto?> GetByIdAsync(Guid tripId, Guid id);
    Task<TripSharedExpenseDto> AddAsync(CreateTripSharedExpenseRequest request);
    Task UpdateAsync(UpdateTripSharedExpenseRequest request);
    Task DeleteAsync(Guid tripId, Guid id);
}