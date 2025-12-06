using System.ComponentModel.DataAnnotations;

namespace plantour_server.DTOs;

public class CreateTripUserRequest
{
    [Required]
    public Guid TripId { get; set; }

    [Required]
    public Guid AdminParticipantId { get; set; }

    public string? ParticipantStatus { get; set; }

    [Required]
    [StringLength(255)]
    public string Email { get; set; } = null!;

    [StringLength(100)]
    public string? FirstName { get; set; }

    [StringLength(100)]
    public string? LastName { get; set; }

    [StringLength(50)]
    public string? Phone { get; set; }

    public string? Notes { get; set; }
}
