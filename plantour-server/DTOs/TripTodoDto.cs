namespace plantour_server.DTOs;

public class TripTodoDto
{
    public Guid Id { get; set; }
    public Guid? ItineraryPartId { get; set; }
    public string? ItineraryPartName { get; set; }
    public string? Category { get; set; }
    public string Name { get; set; } = null!;
    public string? Notes { get; set; }
    public string? Finished { get; set; }
    public bool IsTargeted { get; set; }
    public Guid? TripSharedTodoId { get; set; }
    public DateOnly? AssignedAt { get; set; }
    public DateOnly? AssignedDeadline { get; set; }
}