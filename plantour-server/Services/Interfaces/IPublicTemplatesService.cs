using plantour_server.DTOs;

namespace plantour_server.Services.Interfaces;

public interface IPublicTemplatesService
{
    Task<IEnumerable<PublicTemplateThingDto>> GetAllTemplateThingsAsync();
    Task<IEnumerable<PublicTemplateThingDto>> GetTemplateThingsByTemplateIdAsync(Guid templateId);
    Task<IEnumerable<PublicAgeRangeDto>> GetAgeRangesAsync();
    Task<IEnumerable<PublicTemperatureRangeDto>> GetTemperatureRangesAsync();
    Task<IEnumerable<PublicActivityDto>> GetActivitiesAsync();
}
