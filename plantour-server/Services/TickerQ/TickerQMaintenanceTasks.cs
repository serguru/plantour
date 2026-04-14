using plantour_server.Services.Interfaces;
using TickerQ.Utilities.Base;
using plantour_server.Logging;

namespace plantour_server.Services.TickerQ;

public class TickerQMaintenanceTasks
{
    public const string DeleteExpiredRefreshTokensFunction = "Plantour_DeleteExpiredRefreshTokens";
    public const string DeleteOldAIPromptsFunction = "Plantour_DeleteOldAIPrompts";
    public const string DeleteOldTripUserImprovementsLogFunction = "Plantour_DeleteOldTripUserImprovementsLog";

    private readonly ISchedulerService _schedulerService;
    private readonly IPlantourLogger _logger;

    public TickerQMaintenanceTasks(
        ISchedulerService schedulerService,
        IPlantourLogger logger)
    {
        _schedulerService = schedulerService;
        _logger = logger;
    }

    [TickerFunction(DeleteExpiredRefreshTokensFunction)]
    public async Task DeleteExpiredRefreshTokensAsync(TickerFunctionContext context, CancellationToken cancellationToken)
    {
        await _schedulerService.DeleteExpiredRefreshTokensAsync();
        _logger.LogInformation($"{DeleteExpiredRefreshTokensFunction}", "TickerQ");
    }

    [TickerFunction(DeleteOldAIPromptsFunction)]
    public async Task DeleteOldAIPromptsAsync(TickerFunctionContext context, CancellationToken cancellationToken)
    {
        await _schedulerService.DeleteOldAIPromptsAsync();
        _logger.LogInformation($"{DeleteOldAIPromptsFunction}", "TickerQ");
    }

    [TickerFunction(DeleteOldTripUserImprovementsLogFunction)]
    public async Task DeleteOldTripUserImprovementsLogAsync(TickerFunctionContext context, CancellationToken cancellationToken)
    {
        await _schedulerService.DeleteOldTripUserImprovementsLogAsync();
        _logger.LogInformation($"{DeleteOldTripUserImprovementsLogFunction}", "TickerQ");
    }
}