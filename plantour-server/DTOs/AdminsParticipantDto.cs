namespace plantour_server.DTOs;

public class AdminsParticipantDto
{
    public Guid Id { get; set; }
    public Guid AdminId { get; set; }
    public Guid ParticipantId { get; set; }
    public string? ParticipantStatus { get; set; }
    public byte[]? AccessCodeHash { get; set; }
    public byte[]? AccessCodeSalt { get; set; }
    public string Email { get; set; } = null!;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Phone { get; set; }
    public string? Notes { get; set; }
}
