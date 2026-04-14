namespace plantour_server.Logging;

public interface IPlantourLogger
{
    void LogInformation(string message, string? category = null, object? properties = null);
    void LogWarning(string message, string? category = null, object? properties = null);
    void LogError(string message, string? category = null, object? properties = null);
}