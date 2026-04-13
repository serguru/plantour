namespace plantour_server.Logging;

public interface IPlantourLogger<TCategory>
{
    void LogInformation(string messageTemplate, params object?[] args);
    void LogWarning(string messageTemplate, params object?[] args);
    void LogWarning(Exception? exception, string messageTemplate, params object?[] args);
    void LogError(string messageTemplate, params object?[] args);
    void LogError(Exception? exception, string messageTemplate, params object?[] args);
    void LogCritical(string messageTemplate, params object?[] args);
    void LogCritical(Exception? exception, string messageTemplate, params object?[] args);
}