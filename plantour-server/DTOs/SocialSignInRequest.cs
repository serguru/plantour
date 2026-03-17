using System.ComponentModel.DataAnnotations;

namespace plantour_server.DTOs;

public class SocialSignInRequest
{
    [Required]
    [RegularExpression("^(google|facebook)$", ErrorMessage = "Provider must be either 'google' or 'facebook'")]
    public string Provider { get; set; } = null!;

    public string? GoogleIdToken { get; set; }

    public string? FacebookAccessToken { get; set; }

    public string? BotProtectionToken { get; set; }
}


