namespace plantour_server.Logging;

public interface IPlantourLogger
{
    void LogInformation(string message);
    void LogInformation(string message, string? category);
    void LogInformation(string message, string? category, object? properties);

    void LogWarning(string message);
    void LogWarning(string message, string? category);
    void LogWarning(string message, string? category, object? properties);
    void LogWarning(Exception? exception, string message);
    void LogWarning(Exception? exception, string message, string? category);
    void LogWarning(Exception? exception, string message, string? category, object? properties);

    void LogError(string message);
    void LogError(string message, string? category);
    void LogError(string message, string? category, object? properties);
    void LogError(Exception? exception, string message);
    void LogError(Exception? exception, string message, string? category);
    void LogError(Exception? exception, string message, string? category, object? properties);
}