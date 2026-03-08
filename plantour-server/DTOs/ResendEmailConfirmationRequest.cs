using System.ComponentModel.DataAnnotations;

namespace plantour_server.DTOs;

public class ResendEmailSignInRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = null!;
}
