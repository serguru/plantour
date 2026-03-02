using plantour_server.DTOs;

namespace plantour_server.Services.Interfaces;

public interface ISchedulerService
{
    public void AddDowngradePlanTask();

    public Task DeleteExpiredRefreshTokensAsync();
    public Task DeleteOldAIPromptsAsync();
}
