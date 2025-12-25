namespace plantour_server.DTOs;

public class CreateTripThingRequest
{
    public Guid TripId { get; set; }
    public string? Category { get; set; }
    public string Name { get; set; } = null!;
    public string? Units { get; set; }
    public decimal? Value { get; set; }
    public string? Notes { get; set; }
    public Guid? TripUserPackageId { get; set; }
    public DateTime? FinishedAt { get; set; }
    public string? Finished { get; set; }
   
}
