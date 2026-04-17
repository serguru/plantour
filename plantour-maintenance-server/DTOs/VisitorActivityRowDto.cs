namespace plantour_maintenance_server.DTOs;

public sealed class VisitorActivityRowDto
{
    public required DateOnly Day { get; init; }
    public required string Ip { get; init; }
    public string? Country { get; init; }
    public string? City { get; init; }
}