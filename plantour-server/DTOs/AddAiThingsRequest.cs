namespace plantour_server.DTOs;

public class AddAiThingsRequest
{
    public Guid TripId { get; set; }
    public List<AiItemDto> Things { get; set; } = new List<AiItemDto>();
}
