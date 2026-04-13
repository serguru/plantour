using System.Globalization;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PlantourApi.Models;
using System.Text.RegularExpressions;

namespace plantour_server.Logging;

public sealed class PlantourLogger<TCategory>(
    PlantourLogQueue queue,
    IHttpContextAccessor httpContextAccessor,
    IOptionsMonitor<PlantourLoggerOptions> options) : IPlantourLogger<TCategory>
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private static readonly Regex TemplateTokenRegex = new(@"(?<!\{)\{(?<name>[^{}:]+)(?:[^{}]*)\}(?!\})", RegexOptions.Compiled);

    private readonly PlantourLogQueue _queue = queue;
    private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;
    private readonly IOptionsMonitor<PlantourLoggerOptions> _options = options;
    private readonly string _categoryName = typeof(TCategory).FullName ?? typeof(TCategory).Name;

    public void LogInformation(string messageTemplate, params object?[] args)
    {
        Write(LogLevel.Information, null, messageTemplate, args);
    }

    public void LogWarning(string messageTemplate, params object?[] args)
    {
        Write(LogLevel.Warning, null, messageTemplate, args);
    }

    public void LogWarning(Exception? exception, string messageTemplate, params object?[] args)
    {
        Write(LogLevel.Warning, exception, messageTemplate, args);
    }

    public void LogError(string messageTemplate, params object?[] args)
    {
        Write(LogLevel.Error, null, messageTemplate, args);
    }

    public void LogError(Exception? exception, string messageTemplate, params object?[] args)
    {
        Write(LogLevel.Error, exception, messageTemplate, args);
    }

    public void LogCritical(string messageTemplate, params object?[] args)
    {
        Write(LogLevel.Critical, null, messageTemplate, args);
    }

    public void LogCritical(Exception? exception, string messageTemplate, params object?[] args)
    {
        Write(LogLevel.Critical, exception, messageTemplate, args);
    }

    private void Write(LogLevel logLevel, Exception? exception, string messageTemplate, params object?[] args)
    {
        if (!IsEnabled(logLevel) || string.IsNullOrWhiteSpace(messageTemplate))
        {
            return;
        }

        var (message, propertiesJson) = BuildMessageAndPropertiesJson(messageTemplate, args, exception);
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
            propertiesJson);

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

    private string BuildPropertiesJson(string messageTemplate, object?[] args, Exception? exception)
    {
        var properties = new Dictionary<string, string?>(StringComparer.Ordinal)
        {
            ["original_format"] = messageTemplate
        };

        var matches = TemplateTokenRegex.Matches(messageTemplate);
        for (var index = 0; index < matches.Count; index++)
        {
            var propertyName = matches[index].Groups["name"].Value;
            var propertyValue = index < args.Length ? ConvertToString(args[index]) : null;
            if (!string.IsNullOrWhiteSpace(propertyName))
            {
                properties[propertyName] = propertyValue;
            }
        }

        for (var index = matches.Count; index < args.Length; index++)
        {
            properties[$"arg_{index}"] = ConvertToString(args[index]);
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

    private (string Message, string PropertiesJson) BuildMessageAndPropertiesJson(string messageTemplate, object?[] args, Exception? exception)
    {
        return (RenderMessage(messageTemplate, args), BuildPropertiesJson(messageTemplate, args, exception));
    }

    private static string RenderMessage(string messageTemplate, object?[] args)
    {
        var matches = TemplateTokenRegex.Matches(messageTemplate);
        if (matches.Count == 0)
        {
            return UnescapeBraces(messageTemplate);
        }

        var builder = new StringBuilder();
        var lastIndex = 0;

        for (var index = 0; index < matches.Count; index++)
        {
            var match = matches[index];
            builder.Append(UnescapeBraces(messageTemplate[lastIndex..match.Index]));

            if (index < args.Length)
            {
                builder.Append(ConvertToString(args[index]));
            }
            else
            {
                builder.Append(match.Value);
            }

            lastIndex = match.Index + match.Length;
        }

        builder.Append(UnescapeBraces(messageTemplate[lastIndex..]));
        return builder.ToString();
    }

    private static string UnescapeBraces(string value)
    {
        return value.Replace("{{", "{").Replace("}}", "}");
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
}