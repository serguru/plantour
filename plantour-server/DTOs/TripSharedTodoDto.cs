namespace plantour_server.DTOs;

public class TripSharedTodoDto
{
    public Guid Id { get; set; }
    public Guid TripId { get; set; }
    public string? Category { get; set; }
    public string Name { get; set; } = null!;
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? Address { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public string? Notes { get; set; }
    public Guid? AssignedToId { get; set; }
    public Guid? AssignedTodoId { get; set; }
    public DateTime? AssignedAt { get; set; }
    public DateTime? AssignedDeadline { get; set; }
    public bool Rejected { get; set; }
    public string? AssigneeFinished { get; set; }
    public string? AssigneeEmail { get; set; }
    public string? AssigneeFirstName { get; set; }
    public string? AssigneeLastName { get; set; }
    public bool IsTargeted { get; set; }
}