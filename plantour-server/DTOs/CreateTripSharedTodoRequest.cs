using System.ComponentModel.DataAnnotations;

namespace plantour_server.DTOs;

public class CreateTripSharedTodoRequest
{
    public Guid TripId { get; set; }

    [StringLength(200)]
    public string? Category { get; set; }

    [Required]
    [StringLength(200)]
    public string Name { get; set; } = null!;

    public string? Notes { get; set; }
    public Guid? AssignedToId { get; set; }
    public DateTime? AssignedDeadline { get; set; }
}