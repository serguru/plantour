
namespace plantour_server.DTOs;

public class UpdateTripCommentRequest
{
    public Guid Id { get; set; }
    public Guid TripId { get; set; }
    public string Comment { get; set; } = null!;
}
