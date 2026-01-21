
namespace plantour_server.DTOs;

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

    public int TotalDays { get; set; }

    public int TotalParticipants { get; set; }

    public int TotalPacks { get; set; }

    public int TotalThings { get; set; }
    public int TotalSharedThings { get; set; }

// The current user is included into the trip_users table for this trip
    public bool CurrentUserIncluded { get; set; }

}
