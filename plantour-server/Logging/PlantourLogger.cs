using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PlantourApi.Models;

namespace plantour_server.Logging;

public sealed class PlantourLogger(
    PlantourLogQueue queue,
    IHttpContextAccessor httpContextAccessor,
    IOptionsMonitor<PlantourLoggerOptions> options) : IPlantourLogger
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private readonly PlantourLogQueue _queue = queue;
    private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;
    private readonly IOptionsMonitor<PlantourLoggerOptions> _options = options;

    public void LogInformation(string message)
    {
        Write(LogLevel.Information, null, message, null, null);
    }

    public void LogInformation(string message, string? category)
    {
        Write(LogLevel.Information, null, message, category, null);
    }

    public void LogInformation(string message, string? category, object? properties)
    {
        Write(LogLevel.Information, null, message, category, properties);
    }

    public void LogWarning(string message)
    {
        Write(LogLevel.Warning, null, message, null, null);
    }

    public void LogWarning(string message, string? category)
    {
        Write(LogLevel.Warning, null, message, category, null);
    }

    public void LogWarning(string message, string? category, object? properties)
    {
        Write(LogLevel.Warning, null, message, category, properties);
    }

    public void LogWarning(Exception? exception, string message)
    {
        Write(LogLevel.Warning, exception, message, null, null);
    }

    public void LogWarning(Exception? exception, string message, string? category)
    {
        Write(LogLevel.Warning, exception, message, category, null);
    }

    public void LogWarning(Exception? exception, string message, string? category, object? properties)
    {
        Write(LogLevel.Warning, exception, message, category, properties);
    }

    public void LogError(string message)
    {
        Write(LogLevel.Error, null, message, null, null);
    }

    public void LogError(string message, string? category)
    {
        Write(LogLevel.Error, null, message, category, null);
    }

    public void LogError(string message, string? category, object? properties)
    {
        Write(LogLevel.Error, null, message, category, properties);
    }

    public void LogError(Exception? exception, string message)
    {
        Write(LogLevel.Error, exception, message, null, null);
    }

    public void LogError(Exception? exception, string message, string? category)
    {
        Write(LogLevel.Error, exception, message, category, null);
    }

    public void LogError(Exception? exception, string message, string? category, object? properties)
    {
        Write(LogLevel.Error, exception, message, category, properties);
    }

    private void Write(LogLevel logLevel, Exception? exception, string message, string? category, object? properties)
    {
        if (!IsEnabled(logLevel) || string.IsNullOrWhiteSpace(message))
        {
            return;
        }

        var entry = new PlantourLogEntry(
            Guid.NewGuid(),
            DateTime.UtcNow,
            ToSeverity(logLevel),
            category,
            message,
            GetCurrentUserId(),
            BuildPropertiesJson(properties, exception));

        if (_queue.TryEnqueue(entry))
        {
            return;
        }

        if (_options.CurrentValue.ConsoleFallbackEnabled)
        {
            Console.Error.WriteLine($"[{entry.CreatedAtUtc:O}] [logger-drop] {entry.Category}: {entry.Message}");
        }
    }

    private bool IsEnabled(LogLevel logLevel)
    {
        return IsSupportedLevel(logLevel)
            && logLevel >= ParseMinimumLevel(_options.CurrentValue.MinimumLevel);
    }

    private Guid? GetCurrentUserId()
    {
        var currentUser = _httpContextAccessor.HttpContext?.Items["CurrentUser"] as CurrentUser;
        return currentUser?.IsAuthenticated == true ? currentUser.UserId : null;
    }

    private static string? BuildPropertiesJson(object? properties, Exception? exception)
    {
        if (properties == null && exception == null)
        {
            return null;
        }

        if (exception == null)
        {
            return JsonSerializer.Serialize(properties, JsonOptions);
        }

        var jsonObject = JsonSerializer.SerializeToNode(properties, JsonOptions) as JsonObject ?? new JsonObject();
        jsonObject["exception_type"] = exception.GetType().FullName;
        jsonObject["exception_message"] = exception.Message;
        jsonObject["stack_trace"] = exception.StackTrace;

        return jsonObject.ToJsonString(JsonOptions);
    }

    private static bool IsSupportedLevel(LogLevel logLevel)
    {
        return logLevel is LogLevel.Information or LogLevel.Warning or LogLevel.Error;
    }

    private static LogLevel ParseMinimumLevel(string? configuredLevel)
    {
        return Enum.TryParse<LogLevel>(configuredLevel, true, out var parsedLevel)
            ? parsedLevel
            : LogLevel.Information;
    }

    private static string ToSeverity(LogLevel logLevel)
    {
        return logLevel switch
        {
            LogLevel.Information => "i",
            LogLevel.Warning => "w",
            LogLevel.Error => "e",
            _ => throw new ArgumentOutOfRangeException(nameof(logLevel), logLevel, null)
        };
    }
}