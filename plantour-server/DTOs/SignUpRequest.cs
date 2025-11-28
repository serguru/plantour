using System.ComponentModel.DataAnnotations;

namespace plantour_server.DTOs;

public class SignUpRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = null!;

    [Required]
    [MinLength(6)]
    public string Password { get; set; } = null!;

    [StringLength(100)]
    public string? FirstName { get; set; }

    [StringLength(100)]
    public string? LastName { get; set; }

    [StringLength(50)]
    public string? Phone { get; set; }
}