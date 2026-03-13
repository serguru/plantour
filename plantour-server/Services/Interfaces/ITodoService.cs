using plantour_server.DTOs;

namespace plantour_server.Services;

public interface ITodoService
{
    Task<IEnumerable<TodoDto>> GetAllAsync();
    Task<TodoDto?> GetByIdAsync(Guid id);
    Task<TodoDto> AddAsync(CreateTodoRequest request);
    Task UpdateAsync(UpdateTodoRequest request);
    Task DeleteAsync(Guid id);
    Task<IEnumerable<TodoCategoryDto>> GetAllTodoCategoriesAsync();
    Task<IEnumerable<TodoDto>> GetAllForTripAsync(Guid tripId);
    Task<IEnumerable<TodoDto>> GetAllForTripSharedAsync(Guid tripId);
}