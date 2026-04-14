namespace plantour_maintenance_server.DTOs;

public sealed class LogRowDto
{
    public required Guid Id { get; init; }
    public required DateTimeOffset CreatedAt { get; init; }
    public required string Severity { get; init; }
    public required string Category { get; init; }
    public required string Message { get; init; }
    public Guid? UserId { get; init; }
    public required string Properties { get; init; }
}