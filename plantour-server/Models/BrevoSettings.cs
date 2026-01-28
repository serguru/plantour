namespace plantour_server.Models;

public class BrevoSettings
{
    public string ApiKey { get; set; } = string.Empty;
    public string ApiBaseUrl { get; set; } = "https://api.brevo.com/v3/";
    public string SenderEmail { get; set; } = string.Empty;
    public string SenderName { get; set; } = "Plantour";
}
