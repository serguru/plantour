namespace plantour_server.Models;

public class TurnstileSettings
{
    public bool Enabled { get; set; }
    public string SecretKey { get; set; } = string.Empty;
}