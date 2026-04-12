namespace plantour_maintenance_server.Models;

public class AuthenticatedSuperuser
{
    public required Guid Id { get; init; }
    public required string Email { get; init; }
    public required string Name { get; init; }
}