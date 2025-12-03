
namespace plantour_server.DTOs;

public class TripDto
{
    public Guid Id { get; set; }

    public Guid OwnerId { get; set; }

    public Guid? TripStatusId { get; set; }

    public string ShortDescription { get; set; } = null!;

    public string? Description { get; set; }

    public DateOnly? StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    public bool? RequireWeight { get; set; }

    public TripStatusDto? TripStatus { get; set; }

}
