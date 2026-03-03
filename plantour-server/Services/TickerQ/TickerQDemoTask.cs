using TickerQ.Utilities.Base;

namespace plantour_server.Services.TickerQ;

public class TickerQDemoTask
{
    private readonly ILogger<TickerQDemoTask> _logger;

    public TickerQDemoTask(ILogger<TickerQDemoTask> logger)
    {
        _logger = logger;
    }

    [TickerFunction("Plantour_DemoTickerQTask")]
    public Task RunAsync(TickerFunctionContext context, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "TickerQ demo task executed. JobId: {JobId}, TriggeredAtUtc: {TriggeredAtUtc}",
            context.Id,
            DateTime.UtcNow);

        return Task.CompletedTask;
    }
}