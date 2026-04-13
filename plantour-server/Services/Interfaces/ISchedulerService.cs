using plantour_server.DTOs;

namespace plantour_server.Services.Interfaces;

public interface ISchedulerService
{
    public Task DeleteExpiredRefreshTokensAsync();
    public Task DeleteOldAIPromptsAsync();
    public Task DeleteOldTripUserImprovementsLogAsync();
    public Task ScheduleOrRunDowngradePlanPriceAsync(string oldPlanPrice, string newPlanPrice);
}
