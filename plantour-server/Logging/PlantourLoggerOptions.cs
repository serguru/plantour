using Microsoft.Extensions.Logging;

namespace plantour_server.Logging;

public sealed class PlantourLoggerOptions
{
    public const string SectionName = "PlantourLogging";

    public string Sink { get; set; } = PlantourLogSinks.Console;
    public string MinimumLevel { get; set; } = nameof(LogLevel.Information);
    public int QueueCapacity { get; set; } = 1024;
    public int BatchSize { get; set; } = 50;
    public int FlushIntervalMilliseconds { get; set; } = 2000;
    public bool ConsoleFallbackEnabled { get; set; } = true;
}

public static class PlantourLogSinks
{
    public const string Console = "Console";
    public const string Database = "Database";
    public const string Both = "Both";
}