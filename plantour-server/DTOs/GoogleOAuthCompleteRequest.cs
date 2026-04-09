namespace plantour_server.DTOs;

public class GoogleOAuthCompleteRequest
{
    public string Token { get; set; } = string.Empty;
    public string? BotProtectionToken { get; set; }
}
