using System.ComponentModel.DataAnnotations;

namespace plantour_server.DTOs;

// TODO: fix issues with password update process
public class UpdatePasswordRequest
{
    public string? CurrentPassword { get; set; }

    [Required]
    [MinLength(6)]
    public string NewPassword { get; set; } = null!;
}
