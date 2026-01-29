using System.ComponentModel.DataAnnotations;

namespace plantour_server.DTOs;

public class UpdatePasswordRequest
{
    [Required]
    public string CurrentPassword { get; set; } = null!;

    [Required]
    [MinLength(6)]
    public string NewPassword { get; set; } = null!;
}
