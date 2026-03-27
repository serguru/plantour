using System.ComponentModel.DataAnnotations;

namespace plantour_server.DTOs;

public class UpdateTodoRequest
{
    public Guid Id { get; set; }

    [StringLength(200)]
    public string? Category { get; set; }

    [Required]
    [StringLength(200)]
    public string Name { get; set; } = null!;

    public string? Notes { get; set; }
}