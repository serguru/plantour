
namespace plantour_server.DTOs;

public class TripStatDto
{

    public TripDto Trip { get; set; } = null!;

    public int TotalDays { get; set; }

    public int TotalParticipants { get; set; }

    public int TotalPacks { get; set; }

    public int TotalThings { get; set; }
}
