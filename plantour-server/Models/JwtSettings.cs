namespace plantour_server.Models;

public class JwtSettings
{
    public string SecretKey { get; set; } = null!;
    public string Issuer { get; set; } = null!;
    public string Audience { get; set; } = null!;
    public int AccessTokenExpirationMinutes { get; set; } = 30;
    public int RefreshTokenExpirationDays { get; set; } = 7;
    public int EmailConfirmationTokenMinutes { get; set; } = 60;
    public int TemporaryUserAccessTokenExpirationDays { get; set; } = 14;
    
}