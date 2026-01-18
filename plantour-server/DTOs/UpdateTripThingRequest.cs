namespace plantour_server.DTOs;


public class UpdateTripThingRequest
{
    public Guid Id { get; set; }
    public Guid TripId { get; set; }
    public string? Category { get; set; }
    public string Name { get; set; } = null!;
    public string? Notes { get; set; }
    public string? Units { get; set; }
    public decimal? Value { get; set; }
    public Guid? TripUserPackageId { get; set; }
    public string? Finished { get; set; }
}
