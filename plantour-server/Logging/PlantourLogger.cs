using System.Text.Json;
using PlantourApi.Models;

namespace plantour_server.Logging;

public sealed class PlantourLogger(
    PlantourLogQueue queue,
    IHttpContextAccessor httpContextAccessor,
    PlantourLoggerSettingsStore settingsStore) : IPlantourLogger
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private readonly PlantourLogQueue _queue = queue;
    private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;
    private readonly PlantourLoggerSettingsStore _settingsStore = settingsStore;

    public void LogInformation(string message, string? category = null, object? properties = null)
    {
        Write("i", message, category, properties);
    }

    public void LogWarning(string message, string? category = null, object? properties = null)
    {
        Write("w", message, category, properties);
    }

    public void LogError(string message, string? category = null, object? properties = null)
    {
        Write("e", message, category, properties);
    }

    private void Write(string severity, string message, string? category, object? properties)
    {
        if (string.IsNullOrWhiteSpace(message))
        {
            return;
        }

        var entry = new PlantourLogEntry(
            Guid.NewGuid(),
            DateTime.UtcNow,
            severity,
            category,
            message,
            GetCurrentUserId(),
            BuildPropertiesJson(properties));

        if (_queue.TryEnqueue(entry))
        {
            return;
        }

        if (_settingsStore.Current.ConsoleFallbackEnabled)
        {
            Console.Error.WriteLine($"[{entry.CreatedAtUtc:O}] [logger-drop] {entry.Category}: {entry.Message}");
        }
    }

    private Guid? GetCurrentUserId()
    {
        var currentUser = _httpContextAccessor.HttpContext?.Items["CurrentUser"] as CurrentUser;
        return currentUser?.IsAuthenticated == true ? currentUser.UserId : null;
    }

    private static string? BuildPropertiesJson(object? properties)
    {
        if (properties == null)
        {
            return null;
        }

        return JsonSerializer.Serialize(properties, JsonOptions);
    }
}