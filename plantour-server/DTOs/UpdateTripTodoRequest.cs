using System.ComponentModel.DataAnnotations;

namespace plantour_server.DTOs;

public class UpdateTripTodoRequest
{
    public Guid Id { get; set; }
    public Guid TripId { get; set; }

    [StringLength(200)]
    public string? Category { get; set; }

    [Required]
    [StringLength(200)]
    public string Name { get; set; } = null!;

    public string? Notes { get; set; }
    public string? Finished { get; set; }
}