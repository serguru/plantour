namespace plantour_server.DTOs;

public class DashboardTripDto
{
    public Guid Id { get; set; }
    public string TripStatus { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? Notes { get; set; }
    public string? FromTo { get; set; }
    public bool CurrentUserIncluded { get; set; }
    public int DaysLeft { get; set; }
    public string DaysLeftText { get; set; } = null!;
}
