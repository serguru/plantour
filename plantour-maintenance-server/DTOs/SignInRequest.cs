using System.ComponentModel.DataAnnotations;

namespace plantour_maintenance_server.DTOs;

public class SignInRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = null!;

    [Required]
    public string Password { get; set; } = null!;
}