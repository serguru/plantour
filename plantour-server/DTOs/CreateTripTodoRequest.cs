namespace plantour_server.DTOs;

public class CreateTripTodoRequest
{
    public Guid TripId { get; set; }
    public string? Category { get; set; }
    public string Name { get; set; } = null!;
    public string? Notes { get; set; }
    public DateTime? FinishedAt { get; set; }
    public string? Finished { get; set; }
}