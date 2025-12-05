namespace plantour_server.DTOs;

public class CreateTripUserThingRequest
{
    public Guid TripUserId { get; set; }
    public string? Category { get; set; }
    public string Name { get; set; } = null!;
    public string? Notes { get; set; }
    public string? Units { get; set; }
    public decimal? Value { get; set; }
    public Guid? TripUserPackageId { get; set; }
    public string? PackingStatus { get; set; }
    public DateTime? PackedAt { get; set; }
}
