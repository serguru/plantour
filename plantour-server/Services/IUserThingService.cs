using plantour_server.DTOs;

namespace plantour_server.Services;

public interface IUserThingService
{
    Task<IEnumerable<ThingDto>> GetAllAsync();
    Task<ThingDto?> GetByIdAsync(Guid id);
    Task<ThingDto> AddAsync(CreateThingRequest request);
    Task<bool> UpdateAsync(UpdateThingRequest request);
    Task<bool> DeleteAsync(Guid id);
    Task<IEnumerable<ThingCategoryDto>> GetAllThingCategoriesAsync();
}
