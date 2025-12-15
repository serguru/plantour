namespace plantour_server.DTOs;

public class InsertMultipleTripUserPackageRequest
{
    public Guid TripId { get; set; }
    public Guid[] PackageIds { get; set; } = [];
}
