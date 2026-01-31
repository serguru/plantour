namespace plantour_server.Models;

public class GeminiSettings
{
    public string ApiKey { get; set; } = string.Empty;
    public string ApiBaseUrl { get; set; } = "https://generativelanguage.googleapis.com/v1beta/";
    public string Model { get; set; } = "gemini-2.5-flash";
}
