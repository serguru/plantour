using plantour_server.Utils;

namespace plantour_server.DTOs;

public class AuthResponse : ApiErrorResponse
{
    public string AccessToken { get; set; } = null!;
    public DateTime AccessTokenExpiresAtUtc { get; set; }
    public bool EmailConfirmationRequired { get; set; }
}