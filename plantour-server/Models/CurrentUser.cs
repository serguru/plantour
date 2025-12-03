namespace PlantourApi.Models;

public class CurrentUser
{
    public Guid? UserId { get; set; }
    public Guid? AdminId { get; set; }
    public UserRole Role { get; set; }
    public string? Email { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public bool IsAuthenticated => Role != UserRole.Public;
    public bool IsAdmin => Role == UserRole.Admin;
    public bool IsParticipant => Role == UserRole.Participant;
}