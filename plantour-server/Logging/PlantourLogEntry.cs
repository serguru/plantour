namespace plantour_server.Logging;

public sealed record PlantourLogEntry(
    Guid Id,
    DateTime CreatedAtUtc,
    string Severity,
    string Category,
    string Message,
    Guid? UserId,
    string Properties);