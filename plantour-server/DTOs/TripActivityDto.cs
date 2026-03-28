using plantour_server.DbModels;

namespace plantour_server.DTOs;

public class TripActivityDto
{
    public Guid Id { get; set; }
    public Guid? TripUserId { get; set; }
    public Guid? ItineraryPartId { get; set; }
    public string? Activity { get; set; }
    public string Name { get; set; } = null!;
    public string? Notes { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? Address { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
}
