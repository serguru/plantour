using System.ComponentModel.DataAnnotations;

namespace plantour_server.DTOs;

public class CreateKeyRequest
{
    [Required]
    [StringLength(200)]
    public string Name { get; set; } = null!;

    [Required]
    public string Key { get; set; } = null!;

    public bool Active { get; set; } = true;

    public string? Notes { get; set; }
}