namespace plantour_maintenance_server.DTOs;

public class UserDto
{
    public Guid Id { get; init; }
    public required string Email { get; init; }
    public required string Name { get; init; }
    public string? Phone { get; init; }
    public string? Notes { get; init; }
    public DateTime CreatedAt { get; init; }
}