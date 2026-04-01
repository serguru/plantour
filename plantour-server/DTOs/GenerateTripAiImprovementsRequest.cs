namespace plantour_server.DTOs;

public class GenerateTripAiImprovementsRequest
{
    public Guid TripId { get; set; }
    public bool ReplaceExisting { get; set; }
}