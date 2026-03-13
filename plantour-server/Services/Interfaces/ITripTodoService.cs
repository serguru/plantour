using plantour_server.DTOs;

namespace plantour_server.Services;

public interface ITripTodoService
{
    Task<IEnumerable<TripTodoDto>> GetAllAsync(Guid tripId);
    Task<TripTodoDto?> GetByIdAsync(Guid tripId, Guid id);
    Task<TripTodoDto> AddAsync(CreateTripTodoRequest request);
    Task UpdateAsync(UpdateTripTodoRequest request);
    Task DeleteAsync(Guid tripId, Guid id);
    Task<int> InsertTripUserTodosAsync(Guid tripId, Guid[] ids);
    Task<int> DeleteTripUserTodosAsync(Guid tripId, Guid[] ids);
    Task ToggleFinishedTripTodosAsync(Guid tripId, Guid id, string? finished);
}