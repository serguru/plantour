namespace plantour_server.Services.Interfaces;

public interface IBotProtectionService
{
    Task EnsureHumanVerifiedAsync(string? token, string action, string? remoteIpAddress, CancellationToken cancellationToken = default);
    void EnsureHoneypotIsEmpty(string? value, string fieldName);
}