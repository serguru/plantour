using plantour_server.DTOs;

namespace plantour_server.Services;

public interface IAiService
{
    Task<IEnumerable<AiPromptDto>> GetLatestPrompts();
    Task<IEnumerable<TripAiQuestionDto>> GetLatestTripPlanQuestionsAsync();
    Task<IEnumerable<AiItemDto>> GetAllByPromptAsync(string prompt);
    Task<IEnumerable<AiItemDto>> GetAllByPromptIdAsync(Guid promptId);
    Task<IEnumerable<AiItemDto>> GetAllForTripAsync(Guid tripId, string prompt);
    Task<IEnumerable<AiItemDto>> GetAllForTripSharedAsync(Guid tripId, string prompt);
    Task<IEnumerable<AiItemDto>> GetAllForDicAsync(string prompt);
    Task<TripAiPreviewResponseDto> GetTripPlanPreviewAsync(string question, string currencyText);
    Task<TripAiCreateTripResponseDto> CreateTripFromPlanAsync(CreateTripFromAiPlanRequest request);
    Task<TripAiApplyResponseDto> ApplyTripPlanAsync(Guid tripId, string prompt);
}
