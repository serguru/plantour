namespace plantour_server.DTOs;

public class CreateTripSharedTodoRequest
{
    public Guid TripId { get; set; }
    public string? Category { get; set; }
    public string Name { get; set; } = null!;
    public string? Notes { get; set; }
    public Guid? AssignedToId { get; set; }
    public DateTime? AssignedDeadline { get; set; }
}