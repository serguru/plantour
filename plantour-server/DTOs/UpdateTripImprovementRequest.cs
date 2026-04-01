namespace plantour_server.DTOs;

public class UpdateTripImprovementRequest
{
    public Guid Id { get; set; }
    public Guid TripId { get; set; }
    public string Name { get; set; } = null!;
    public string? Notes { get; set; }
    public int ImprovementOrder { get; set; }
    public string? Finished { get; set; }
}