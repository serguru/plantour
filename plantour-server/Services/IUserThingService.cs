using plantour_server.DTOs;

namespace plantour_server.Services;

public interface IUserThingService
{
    Task<IEnumerable<UserThingDto>> GetAllAsync();
    Task<UserThingDto?> GetByIdAsync(Guid id);
    Task<UserThingDto> AddAsync(CreateUserThingRequest request);
    Task<bool> UpdateAsync(UpdateUserThingRequest request);
    Task<bool> DeleteAsync(Guid id);
    Task<IEnumerable<ThingCategoryDto>> GetAllThingCategoriesAsync();
}
