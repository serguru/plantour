
namespace plantour_server.DTOs;

public class TripThingDto
{
    public Guid Id { get; set; }
    public string? Category { get; set; }
    public string Name { get; set; } = null!;
    public string? Notes { get; set; }
    public string? Units { get; set; }
    public decimal? Value { get; set; }
    public Guid? TripUserPackageId { get; set; }
    public string? PackageName { get; set; }
    public string? PackageLabel { get; set; }
    public string? Finished { get; set; }
    public bool IsTargeted { get; set; }

    public Guid? TripSharedThingId { get; set; }
    public DateOnly? AssignedAt { get; set; }
    public DateOnly? AssignedDeadline { get; set; }

}

