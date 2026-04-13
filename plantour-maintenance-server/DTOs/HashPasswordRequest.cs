using System.ComponentModel.DataAnnotations;

namespace plantour_maintenance_server.DTOs;

public class HashPasswordRequest
{
    [Required]
    public string Password { get; set; } = null!;
}