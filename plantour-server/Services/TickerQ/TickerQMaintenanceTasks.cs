using plantour_server.Services.Interfaces;
using TickerQ.Utilities.Base;

namespace plantour_server.Services.TickerQ;

public class TickerQMaintenanceTasks
{
    public const string DeleteExpiredRefreshTokensFunction = "Plantour_DeleteExpiredRefreshTokens";
    public const string DeleteOldAIPromptsFunction = "Plantour_DeleteOldAIPrompts";
    public const string DeleteOldTripUserImprovementsLogFunction = "Plantour_DeleteOldTripUserImprovementsLog";

    private readonly ISchedulerService _schedulerService;
    private readonly ILogger<TickerQMaintenanceTasks> _logger;

    public TickerQMaintenanceTasks(
        ISchedulerService schedulerService,
        ILogger<TickerQMaintenanceTasks> logger)
    {
        _schedulerService = schedulerService;
        _logger = logger;
    }

    [TickerFunction(DeleteExpiredRefreshTokensFunction)]
    public async Task DeleteExpiredRefreshTokensAsync(TickerFunctionContext context, CancellationToken cancellationToken)
    {
        await _schedulerService.DeleteExpiredRefreshTokensAsync();
        // TODO LOG
        // _logger.LogInformation("TickerQ maintenance executed: {Function}, event_type: {event_type}, subtype: {subtype}", DeleteExpiredRefreshTokensFunction, "scheduler", "delete_expired_refresh_tokens");
    }

    [TickerFunction(DeleteOldAIPromptsFunction)]
    public async Task DeleteOldAIPromptsAsync(TickerFunctionContext context, CancellationToken cancellationToken)
    {
        await _schedulerService.DeleteOldAIPromptsAsync();
        // TODO LOG
        // _logger.LogInformation("TickerQ maintenance executed: {Function}", DeleteOldAIPromptsFunction);
    }

    [TickerFunction(DeleteOldTripUserImprovementsLogFunction)]
    public async Task DeleteOldTripUserImprovementsLogAsync(TickerFunctionContext context, CancellationToken cancellationToken)
    {
        await _schedulerService.DeleteOldTripUserImprovementsLogAsync();
        // TODO LOG
        // _logger.LogInformation("TickerQ maintenance executed: {Function}", DeleteOldTripUserImprovementsLogFunction);
    }
}