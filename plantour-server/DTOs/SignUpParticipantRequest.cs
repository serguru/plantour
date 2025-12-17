using System.ComponentModel.DataAnnotations;

namespace plantour_server.DTOs;

public class SignUpParticipantRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = null!;

    [StringLength(100)]
    public string? FirstName { get; set; }

    [StringLength(100)]
    public string? LastName { get; set; }

    [StringLength(50)]
    public string? Phone { get; set; }

    public string? Notes { get; set; }
    [Required]
    public Guid ParticipantStatusId { get; set; }
}