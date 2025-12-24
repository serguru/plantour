using plantour_server.DTOs;

namespace plantour_server.Services;

public interface IThingService
{
    Task<IEnumerable<ThingDto>> GetAllAsync();
    Task<ThingDto?> GetByIdAsync(Guid id);
    Task<ThingDto> AddAsync(CreateThingRequest request);
    Task UpdateAsync(UpdateThingRequest request);
    Task DeleteAsync(Guid id);
    Task<IEnumerable<ThingCategoryDto>> GetAllThingCategoriesAsync();
}
