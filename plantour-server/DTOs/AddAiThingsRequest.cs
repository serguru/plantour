namespace plantour_server.DTOs;

public class AddAiThingsRequest
{
    public Guid TripId { get; set; }
    public List<AIItemDto> Things { get; set; } = [];
}
