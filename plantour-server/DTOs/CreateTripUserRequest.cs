using System.ComponentModel.DataAnnotations;

namespace plantour_server.DTOs;

public class CreateTripUserRequest
{
    [Required]
    public Guid TripId { get; set; }

    [Required]
    public Guid AdminParticipantId { get; set; }

    public string? Notes { get; set; }
}
