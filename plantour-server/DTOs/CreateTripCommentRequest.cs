namespace plantour_server.DTOs;

public class CreateTripCommentRequest
{
    public Guid TripId { get; set; }
    public string Comment { get; set; } = null!;
}
