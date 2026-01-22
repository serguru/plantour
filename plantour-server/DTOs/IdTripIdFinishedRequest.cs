namespace plantour_server.DTOs;

public class IdTripIdFinishedRequest
{
    public Guid Id { get; set; }
    public Guid TripId { get; set; }
    public string? Finished { get; set; }
}
