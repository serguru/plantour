namespace plantour_server.DTOs;

public class UpdateTripSharedRequest
{
    public Guid Id { get; set; }
    public Guid TripId { get; set; }
    public string? Category { get; set; }
    public string Name { get; set; } = null!;
    public string? Units { get; set; }
    public decimal? Value { get; set; }
    public string? Notes { get; set; }
    public Guid? AssignedToId { get; set; }
    public Guid? AssignedThingId { get; set; }
    public DateTime? AssignedDeadline { get; set; }
    public bool Rejected { get; set; }
}
