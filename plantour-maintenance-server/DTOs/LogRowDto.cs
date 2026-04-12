namespace plantour_maintenance_server.DTOs;

public sealed class LogRowDto
{
    public required int Id { get; init; }
    public required DateTimeOffset TimeStamp { get; init; }
    public string? Level { get; init; }
    public string? EventType { get; init; }
    public string? Subtype { get; init; }
    public string? MessageTemplate { get; init; }
    public string? Exception { get; init; }
}