namespace plantour_server.DTOs;

public class ContactSubmissionDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? PhoneNumber { get; set; }
    public string? SubjectCategory { get; set; }
    public string MessageBody { get; set; } = null!;
    public string? ContactStatus { get; set; }
    public Guid? AssignedAgentId { get; set; }
    public string? InternalNotes { get; set; }
    public DateTime? CreatedAt { get; set; }
}
