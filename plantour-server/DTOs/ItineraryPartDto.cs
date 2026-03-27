namespace plantour_server.DTOs;

public class ItineraryPartDto
{
    public Guid Id { get; set; }
    public Guid TripId { get; set; }
    public string Name { get; set; } = null!;
    public string? Category { get; set; }
    public string? Address { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public string? Notes { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public List<ItineraryTodoSummaryDto> Todos { get; set; } = [];
}