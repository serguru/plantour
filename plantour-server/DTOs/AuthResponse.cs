namespace plantour_server.DTOs;

public class AuthResponse
{
    public string AccessToken { get; set; } = null!;
    public string RefreshToken { get; set; } = null!;
    public DateTime AccessTokenExpiresAtUtc { get; set; }
    public bool EmailConfirmationRequired { get; set; }
}