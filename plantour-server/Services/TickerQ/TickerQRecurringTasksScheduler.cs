using TickerQ.Utilities.Entities;
using TickerQ.Utilities.Interfaces;
using TickerQ.Utilities.Interfaces.Managers;

namespace plantour_server.Services.TickerQ;

public class TickerQRecurringTasksScheduler : IHostedService
{
    private sealed record RecurringCronTask(string Function, string Expression, string Description);

    private readonly ICronTickerManager<CronTickerEntity> _cronTickerManager;
    private readonly ITickerPersistenceProvider<TimeTickerEntity, CronTickerEntity> _persistenceProvider;
    private readonly ILogger<TickerQRecurringTasksScheduler> _logger;

    public TickerQRecurringTasksScheduler(
        ICronTickerManager<CronTickerEntity> cronTickerManager,
        ITickerPersistenceProvider<TimeTickerEntity, CronTickerEntity> persistenceProvider,
        ILogger<TickerQRecurringTasksScheduler> logger)
    {
        _cronTickerManager = cronTickerManager;
        _persistenceProvider = persistenceProvider;
        _logger = logger;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        var recurringTasks = new[]
        {
            new RecurringCronTask(
                TickerQMaintenanceTasks.DeleteExpiredRefreshTokensFunction,
                CronPreset.DailyAt01_00Utc.ToExpression(),
                "Daily cleanup of expired refresh tokens (01:00 UTC)"),
            new RecurringCronTask(
                TickerQMaintenanceTasks.DeleteOldAIPromptsFunction,
                CronPreset.DailyAt01_10Utc.ToExpression(),
                "Daily cleanup of old AI prompts (01:10 UTC)"),
            new RecurringCronTask(
                TickerQMaintenanceTasks.DeleteOldErrorLogsFunction,
                CronPreset.DailyAt01_20Utc.ToExpression(),
                "Daily cleanup of old error logs (01:20 UTC)"),
            new RecurringCronTask(
                TickerQMaintenanceTasks.DeleteOldTripUserImprovementsLogFunction,
                CronPreset.DailyAt01_30Utc.ToExpression(),
                "Daily cleanup of old trip user improvements log rows (01:30 UTC)")
        };

        await ResetRecurringCronTickersAsync(recurringTasks, cancellationToken);
    }

    private async Task ResetRecurringCronTickersAsync(
        RecurringCronTask[] recurringTasks,
        CancellationToken cancellationToken)
    {
        var storedCronTickers = await _persistenceProvider.GetCronTickers(_ => true, cancellationToken);

        if (storedCronTickers.Length > 0)
        {
            var deleteTasks = storedCronTickers
                .Select(ticker => DeleteTickerAsync(ticker, "startup reset", cancellationToken));

            await Task.WhenAll(deleteTasks);

            _logger.LogInformation(
                "TickerQ recurring task reset deleted existing cron tasks. DeletedAttemptCount: {DeletedAttemptCount}",
                storedCronTickers.Length);
        }

        foreach (var configuredTask in recurringTasks)
        {
            var addResult = await _cronTickerManager.AddAsync(new CronTickerEntity
            {
                Function = configuredTask.Function,
                Expression = configuredTask.Expression,
                Description = configuredTask.Description,
                Request = Array.Empty<byte>(),
                Retries = 0,
                RetryIntervals = Array.Empty<int>()
            }, cancellationToken);

            if (addResult.IsSucceeded)
            {
                _logger.LogInformation(
                    "TickerQ recurring task created. Function: {Function}, Expression: {Expression}, CronTickerId: {CronTickerId}",
                    configuredTask.Function,
                    configuredTask.Expression,
                    addResult.Result.Id);
                continue;
            }

            _logger.LogWarning(
                "Failed to create TickerQ recurring task. Function: {Function}, Expression: {Expression}, Result: {@Result}",
                configuredTask.Function,
                configuredTask.Expression,
                addResult);
        }
    }

    private async Task DeleteTickerAsync(CronTickerEntity ticker, string reason, CancellationToken cancellationToken)
    {
        var deleteResult = await _cronTickerManager.DeleteAsync(ticker.Id, cancellationToken);

        if (deleteResult.IsSucceeded)
        {
            _logger.LogWarning(
                "Deleted outdated TickerQ cron task. Reason: {Reason}, CronTickerId: {CronTickerId}, Function: {Function}, Expression: {Expression}",
                reason,
                ticker.Id,
                ticker.Function,
                ticker.Expression);
            return;
        }

        _logger.LogWarning(
            "Failed to delete outdated TickerQ cron task. Reason: {Reason}, CronTickerId: {CronTickerId}, Function: {Function}, Expression: {Expression}, Result: {@Result}",
            reason,
            ticker.Id,
            ticker.Function,
            ticker.Expression,
            deleteResult);
    }

    public Task StopAsync(CancellationToken cancellationToken)
        => Task.CompletedTask;
}