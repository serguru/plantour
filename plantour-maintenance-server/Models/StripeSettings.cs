namespace plantour_maintenance_server.Models;

public sealed class StripeSettings
{
    public string? ApiBaseUrl { get; init; }
    public string? ApiKey { get; init; }
}