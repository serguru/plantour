using plantour_server.DTOs;

namespace plantour_server.Services;

public interface ITripExpenseService
{
    Task<IEnumerable<TripExpenseDto>> GetAllAsync(Guid tripId);
    Task<IEnumerable<TripExpenseDto>> GetAllForTripAsync(Guid tripId);
    Task<TripExpenseDto?> GetByIdAsync(Guid tripId, Guid id);
    Task<decimal> GetSuggestedRateAsync(Guid tripId, Guid currencyId);
    Task<TripExpenseDto> AddAsync(CreateTripExpenseRequest request);
    Task UpdateAsync(UpdateTripExpenseRequest request);
    Task DeleteAsync(Guid tripId, Guid id);
}