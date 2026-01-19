namespace plantour_server.DTOs;

public class TripUserDto
{
    public Guid Id { get; set; }


    public Guid AdminParticipantId { get; set; }
    public string Email { get; set; } = null!;

    public string? FirstName { get; set; }

    public string? LastName { get; set; }

    public string? Phone { get; set; }

    public string? Notes { get; set; }
}
