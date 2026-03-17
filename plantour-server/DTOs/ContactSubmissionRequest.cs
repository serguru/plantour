using System.ComponentModel.DataAnnotations;

namespace plantour_server.DTOs;

public class ContactSubmissionRequest
{
    [Required(ErrorMessage = "Full name is required")]
    [StringLength(255, MinimumLength = 2, ErrorMessage = "Full name must be between 2 and 255 characters")]
    public string FullName { get; set; } = null!;

    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email address")]
    [StringLength(255, ErrorMessage = "Email must not exceed 255 characters")]
    public string Email { get; set; } = null!;

    [Phone(ErrorMessage = "Invalid phone number format")]
    [StringLength(20, ErrorMessage = "Phone number must not exceed 20 characters")]
    public string? PhoneNumber { get; set; }

    [StringLength(100, ErrorMessage = "Subject category must not exceed 100 characters")]
    public string? SubjectCategory { get; set; }

    [Required(ErrorMessage = "Message is required")]
    [StringLength(5000, MinimumLength = 10, ErrorMessage = "Message must be between 10 and 5000 characters")]
    public string MessageBody { get; set; } = null!;

    [StringLength(255, ErrorMessage = "Website must not exceed 255 characters")]
    public string? Website { get; set; }

    public string? BotProtectionToken { get; set; }
}
