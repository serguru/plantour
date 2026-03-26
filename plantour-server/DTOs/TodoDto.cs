namespace plantour_server.DTOs;

public class TodoDto
{
    public Guid Id { get; set; }
    public string? Category { get; set; }
    public string Name { get; set; } = null!;
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? Address { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public string? Notes { get; set; }
    public bool IsTargeted { get; set; }
}