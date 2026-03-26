namespace plantour_server.DTOs;

public class TripTodoDto
{
    public Guid Id { get; set; }
    public string? Category { get; set; }
    public string Name { get; set; } = null!;
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? Address { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public string? Notes { get; set; }
    public string? Finished { get; set; }
    public bool IsTargeted { get; set; }
    public Guid? TripSharedTodoId { get; set; }
    public DateOnly? AssignedAt { get; set; }
    public DateOnly? AssignedDeadline { get; set; }
}