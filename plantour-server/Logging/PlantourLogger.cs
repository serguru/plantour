using System.Globalization;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PlantourApi.Models;

namespace plantour_server.Logging;

internal sealed class PlantourLogger(
    string categoryName,
    PlantourLogQueue queue,
    IHttpContextAccessor httpContextAccessor,
    IOptionsMonitor<PlantourLoggerOptions> options) : ILogger
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private readonly string _categoryName = categoryName;
    private readonly PlantourLogQueue _queue = queue;
    private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;
    private readonly IOptionsMonitor<PlantourLoggerOptions> _options = options;

    public IDisposable BeginScope<TState>(TState state) where TState : notnull
    {
        return NullScope.Instance;
    }

    public bool IsEnabled(LogLevel logLevel)
    {
        if (!IsSupportedLevel(logLevel))
        {
            return false;
        }

        var currentOptions = _options.CurrentValue;

        if (!MatchesCategoryPrefix(currentOptions.CategoryPrefixes))
        {
            return false;
        }

        return logLevel >= ParseMinimumLevel(currentOptions.MinimumLevel);
    }

    public void Log<TState>(
        LogLevel logLevel,
        EventId eventId,
        TState state,
        Exception? exception,
        Func<TState, Exception?, string> formatter)
    {
        if (!IsEnabled(logLevel))
        {
            return;
        }

        var message = formatter(state, exception);
        if (string.IsNullOrWhiteSpace(message))
        {
            return;
        }

        var entry = new PlantourLogEntry(
            Guid.NewGuid(),
            DateTime.UtcNow,
            ToSeverity(logLevel),
            _categoryName,
            message,
            GetCurrentUserId(),
            BuildPropertiesJson(eventId, state, exception));

        if (_queue.TryEnqueue(entry))
        {
            return;
        }

        if (_options.CurrentValue.ConsoleFallbackEnabled)
        {
            Console.Error.WriteLine($"[{entry.CreatedAtUtc:O}] [logger-drop] {entry.Category}: {entry.Message}");
        }
    }

    private bool MatchesCategoryPrefix(IEnumerable<string> categoryPrefixes)
    {
        foreach (var categoryPrefix in categoryPrefixes)
        {
            if (!string.IsNullOrWhiteSpace(categoryPrefix)
                && _categoryName.StartsWith(categoryPrefix, StringComparison.Ordinal))
            {
                return true;
            }
        }

        return false;
    }

    private Guid? GetCurrentUserId()
    {
        var currentUser = _httpContextAccessor.HttpContext?.Items["CurrentUser"] as CurrentUser;
        return currentUser?.IsAuthenticated == true ? currentUser.UserId : null;
    }

    private string BuildPropertiesJson<TState>(EventId eventId, TState state, Exception? exception)
    {
        var properties = new Dictionary<string, string?>(StringComparer.Ordinal);

        if (eventId.Id != 0)
        {
            properties["event_id"] = eventId.Id.ToString(CultureInfo.InvariantCulture);
        }

        if (!string.IsNullOrWhiteSpace(eventId.Name))
        {
            properties["event_name"] = eventId.Name;
        }

        if (state is IEnumerable<KeyValuePair<string, object?>> pairs)
        {
            foreach (var pair in pairs)
            {
                var key = pair.Key == "{OriginalFormat}" ? "original_format" : pair.Key;
                properties[key] = ConvertToString(pair.Value);
            }
        }

        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext != null)
        {
            properties["request_path"] = httpContext.Request.Path.Value;
            properties["request_method"] = httpContext.Request.Method;
            properties["trace_id"] = httpContext.TraceIdentifier;
        }

        if (exception != null)
        {
            properties["exception_type"] = exception.GetType().FullName;
            properties["exception_message"] = exception.Message;
            properties["stack_trace"] = exception.StackTrace;
        }

        return JsonSerializer.Serialize(properties, JsonOptions);
    }

    private static bool IsSupportedLevel(LogLevel logLevel)
    {
        return logLevel is LogLevel.Information or LogLevel.Warning or LogLevel.Error or LogLevel.Critical;
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
            LogLevel.Critical => "e",
            _ => throw new ArgumentOutOfRangeException(nameof(logLevel), logLevel, null)
        };
    }

    private static string? ConvertToString(object? value)
    {
        return value switch
        {
            null => null,
            DateTime dateTime => dateTime.ToUniversalTime().ToString("O", CultureInfo.InvariantCulture),
            DateTimeOffset dateTimeOffset => dateTimeOffset.ToUniversalTime().ToString("O", CultureInfo.InvariantCulture),
            IFormattable formattable => formattable.ToString(null, CultureInfo.InvariantCulture),
            _ => value.ToString()
        };
    }

    private sealed class NullScope : IDisposable
    {
        public static readonly NullScope Instance = new();

        public void Dispose()
        {
        }
    }
}