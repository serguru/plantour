namespace plantour_server.DTOs;

public class AiItemsRequest
{
    public string Prompt { get; set; } = string.Empty;
    public Guid? TripId { get; set; }
}
