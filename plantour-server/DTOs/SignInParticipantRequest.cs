using System.ComponentModel.DataAnnotations;

namespace plantour_server.DTOs;

public class SignInParticipantRequest
{
    [Required]
    [StringLength(8)]
    public string AccessCode { get; set; } = null!;

    public string? Password { get; set; }
}