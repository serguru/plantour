using System.ComponentModel.DataAnnotations;

namespace plantour_server.DTOs;

public class SendInvitationEmailRequest
{
    public string? AccessCode { get; set; }

    [StringLength(100)]
    public string? FirstName { get; set; }

    [StringLength(100)]
    public string? LastName { get; set; }

    [Required]
    [EmailAddress]
    public string Email { get; set; } = null!;

    [StringLength(50)]
    public string? Phone { get; set; }

    [Required]
    [StringLength(200)]
    public string Subject { get; set; } = null!;

    [Required]
    public string Message { get; set; } = null!;

    [Required]
    public DateTime ExpiresAt { get; set; }

    [StringLength(50)]
    public string? CommunicationType { get; set; }

    public string? Notes { get; set; }
}
