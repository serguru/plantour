namespace plantour_server.Models;

public class SocialAuthSettings
{
    public string GoogleClientId { get; set; } = string.Empty;
    public string GoogleClientSecret { get; set; } = string.Empty;
    public string GoogleOAuthDefaultReturnUrl { get; set; } = string.Empty;
    public string FacebookAppId { get; set; } = string.Empty;
    public string FacebookAppSecret { get; set; } = string.Empty;
}
