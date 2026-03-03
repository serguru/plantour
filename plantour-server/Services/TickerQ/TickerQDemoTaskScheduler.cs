using TickerQ.Utilities.Entities;
using TickerQ.Utilities.Interfaces.Managers;

namespace plantour_server.Services.TickerQ;

public class TickerQDemoTaskScheduler : IHostedService
{
    private readonly ITimeTickerManager<TimeTickerEntity> _timeTickerManager;
    private readonly IHostEnvironment _hostEnvironment;
    private readonly ILogger<TickerQDemoTaskScheduler> _logger;

    public TickerQDemoTaskScheduler(
        ITimeTickerManager<TimeTickerEntity> timeTickerManager,
        IHostEnvironment hostEnvironment,
        ILogger<TickerQDemoTaskScheduler> logger)
    {
        _timeTickerManager = timeTickerManager;
        _hostEnvironment = hostEnvironment;
        _logger = logger;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        if (!_hostEnvironment.IsDevelopment())
        {
            return;
        }

        var executionTime = DateTime.UtcNow.AddSeconds(20);

        var result = await _timeTickerManager.AddAsync(new TimeTickerEntity
        {
            Function = "Plantour_DemoTickerQTask",
            Description = "Plantour demo job for TickerQ integration",
            ExecutionTime = executionTime
        });

        if (result.IsSucceeded)
        {
            _logger.LogInformation(
                "TickerQ demo task scheduled. JobId: {JobId}, ExecutionTimeUtc: {ExecutionTimeUtc}, event_type: {event_type}, subtype: {subtype}",
                result.Result.Id,
                executionTime,
                "scheduler",
                "demo task");
            return;
        }

        _logger.LogWarning(
            "Failed to schedule the TickerQ demo task during startup. event_type: {event_type}, subtype: {subtype}",
            "scheduler",
            "demo task");
    }

    public Task StopAsync(CancellationToken cancellationToken)
        => Task.CompletedTask;
}