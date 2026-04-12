namespace plantour_maintenance_server.Models;

public class AccessTokenResult
{
    public required string AccessToken { get; init; }
    public required DateTime ExpiresAtUtc { get; init; }
}