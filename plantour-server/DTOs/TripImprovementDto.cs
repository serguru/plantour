namespace plantour_server.DTOs;

public class TripImprovementDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Notes { get; set; }
    public int ImprovementOrder { get; set; }
    public string? Finished { get; set; }
}