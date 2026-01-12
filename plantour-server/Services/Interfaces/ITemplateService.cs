using plantour_server.DTOs;

namespace plantour_server.Services;

public interface ITemplateService
{
    Task<IEnumerable<VTemplateThingsFullDto>> GetAllAsync();
    Task<IEnumerable<VTemplateThingsFullDto>> GetAllForTripAsync(Guid tripId);
    Task<IEnumerable<VTemplateThingsFullDto>> GetAllForTripSharedAsync(Guid tripId);
    Task<IEnumerable<VTemplateThingsFullDto>> GetAllForDicAsync();
}




