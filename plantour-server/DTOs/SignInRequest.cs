using System.ComponentModel.DataAnnotations;

namespace plantour_server.DTOs;

public class SignInRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = null!;

    public string? BotProtectionToken { get; set; }

}