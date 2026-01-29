using System.ComponentModel.DataAnnotations;

namespace plantour_server.DTOs;

// TODO: fix issues with password update process
public class UpdatePasswordRequest
{
    [Required]
    public string CurrentPassword { get; set; } = null!;

    [Required]
    [MinLength(6)]
    public string NewPassword { get; set; } = null!;
}
