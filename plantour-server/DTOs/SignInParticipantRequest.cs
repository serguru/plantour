using System.ComponentModel.DataAnnotations;

namespace plantour_server.DTOs;

public class SignInParticipantRequest
{
    [Required]
    [StringLength(8)]
    public string AccessCode { get; set; } = null!; // Plain code, will be hashed for verification

    public string? BotProtectionToken { get; set; }
}