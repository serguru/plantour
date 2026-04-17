namespace plantour_maintenance_server.DTOs;

public class AuthResponse
{
    public required string AccessToken { get; init; }
    public required DateTime ExpiresAtUtc { get; init; }
    public required UserDto User { get; init; }
}