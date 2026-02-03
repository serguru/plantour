
namespace plantour_server.DTOs;

// TODO: Explain in Help "No package" idea

public class TripDto
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public Guid TripStatusId { get; set; }
    public string TripStatus { get; set; } = null!;

    public string Name { get; set; } = null!;

    public string? Notes { get; set; }

    public DateOnly? StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    public bool CurrentUserIncluded { get; set; }

    public int DaysLeft { get; set; }
    public string DaysLeftText { get; set; } = null!;

    public PlantourStatsDto TripStats  { get; set; } = null!;
    public PlantourStatsDto UserStats  { get; set; } = null!;

}
