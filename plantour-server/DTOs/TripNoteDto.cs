namespace plantour_server.DTOs;

public class TripNoteDto
{
    public Guid Id { get; set; }
    public Guid? TripUserId { get; set; }
    public Guid? TripActivityId { get; set; }
    public string Title { get; set; } = null!;
    public string? ContentJson { get; set; }
    public DateTime? CreatedAt { get; set; }
    public string? TripActivityName { get; set; }
}

public class CreateTripNoteRequest
{
    public Guid TripId { get; set; }
    public Guid? TripActivityId { get; set; }
    public string Title { get; set; } = null!;
    public string? ContentJson { get; set; }
}

public class UpdateTripNoteRequest
{
    public Guid Id { get; set; }
    public Guid TripId { get; set; }
    public Guid? TripActivityId { get; set; }
    public string Title { get; set; } = null!;
    public string? ContentJson { get; set; }
}