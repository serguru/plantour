
namespace plantour_server.DTOs;

public class TripDto
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public string? TripStatus { get; set; }

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public DateOnly? StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

}
