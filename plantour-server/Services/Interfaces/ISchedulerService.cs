using plantour_server.DTOs;

namespace plantour_server.Services.Interfaces;

public interface ISchedulerService
{
    public Task DeleteExpiredRefreshTokensAsync();
    public Task DeleteOldAIPromptsAsync();
    public Task DeleteOldErrorLogsAsync();
    public Task ScheduleDowngradePlanPriceAsync(string oldPlanPrice, string newPlanPrice);
    public Task DowngradePlanPriceAsync(Guid userId, string oldPlanPrice, string newPlanPrice);

}
