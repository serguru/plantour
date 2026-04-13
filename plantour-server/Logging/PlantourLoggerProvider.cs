using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace plantour_server.Logging;

public sealed class PlantourLoggerProvider(
    PlantourLogQueue queue,
    IHttpContextAccessor httpContextAccessor,
    IOptionsMonitor<PlantourLoggerOptions> options) : ILoggerProvider
{
    private readonly PlantourLogQueue _queue = queue;
    private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;
    private readonly IOptionsMonitor<PlantourLoggerOptions> _options = options;

    public ILogger CreateLogger(string categoryName)
    {
        return new PlantourLogger(categoryName, _queue, _httpContextAccessor, _options);
    }

    public void Dispose()
    {
        _queue.Complete();
    }
}