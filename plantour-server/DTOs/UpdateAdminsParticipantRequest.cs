using System.ComponentModel.DataAnnotations;

namespace plantour_server.DTOs;

public class UpdateAdminsParticipantRequest
{
    [Required]
    public Guid Id { get; set; }
    [Required]
    public Guid ParticipantStatusId { get; set; }
    public string? Notes { get; set; }
}
