using plantour_server.DTOs;

namespace plantour_server.Services;

public interface IAiService
{
    Task<IEnumerable<AiPromptDto>> GetLatestPrompts();
    Task<IEnumerable<AiItemDto>> GetAllByPromptAsync(string prompt);
    Task<IEnumerable<AiItemDto>> GetAllByPromptIdAsync(Guid promptId);
    Task<IEnumerable<AiItemDto>> GetAllForTripAsync(Guid tripId, Guid promptId);
    Task<IEnumerable<AiItemDto>> GetAllForTripSharedAsync(Guid tripId, Guid promptId);
    Task<IEnumerable<AiItemDto>> GetAllForDicAsync(Guid promptId);
    
}
