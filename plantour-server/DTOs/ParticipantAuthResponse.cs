namespace plantour_server.DTOs;

public class ParticipantAuthResponse
{
    public Guid ParticipantId { get; set; }
    public string Email { get; set; } = null!;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string AccessCode { get; set; } = null!;
    
    public Guid AdminId { get; set; }
    public string AdminEmail { get; set; } = null!;
    public string? AdminFirstName { get; set; }
    public string? AdminLastName { get; set; }
    
    public string AccessToken { get; set; } = null!;
    public string RefreshToken { get; set; } = null!;
    public DateTime ExpiresAt { get; set; }
    public string Role { get; set; } = "Participant";
}