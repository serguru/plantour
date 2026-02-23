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
    Task<IEnumerable<ThingDto>> GetAllForTripAsync(Guid tripId);
    Task<IEnumerable<ThingDto>> GetAllForTripSharedAsync(Guid tripId);
    Task<int> InsertTemplateUserThingsAsync(Guid[] ids);
    Task<int> InsertTemplateAiUserThingsAsync(Guid[] ids);
    Task<int> DeleteTemplateUserThingsAsync(Guid[] ids);
    Task<int> DeleteTemplateAiUserThingsAsync(Guid[] ids);
    //Task<int> InsertFromAiTemplateAsync(IEnumerable<AiItemDto> items);






    
}
