using System.ComponentModel.DataAnnotations;

namespace plantour_server.DTOs;

public class CreateAdminsParticipantRequest
{
    [Required]
    public Guid ParticipantId { get; set; }
    
    public string? ParticipantStatus { get; set; }
    
    [Required]
    [StringLength(255)]
    [EmailAddress]
    public string Email { get; set; } = null!;
    
    [StringLength(100)]
    public string? FirstName { get; set; }
    
    [StringLength(100)]
    public string? LastName { get; set; }
    
    [StringLength(50)]
    public string? Phone { get; set; }
    
    public string? Notes { get; set; }
}
