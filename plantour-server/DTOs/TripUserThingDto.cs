
namespace plantour_server.DTOs;

public class TripUserThingDto
{
    public Guid Id { get; set; }
    public Guid TripUserId { get; set; }
    public string? Category { get; set; }
    public string Name { get; set; } = null!;
    public string? Units { get; set; }
    public decimal? Value { get; set; }
    public Guid? TripUserPackageId { get; set; }
    public string? PackingStatus { get; set; }
    public DateTime? PackedAt { get; set; }
}
