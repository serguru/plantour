namespace PlantourApi.Models;


public class CurrentUser
{
    public Guid UserId { get; set; }
    public Guid AdminId { get; set; }
    public UserRole Role { get; set; }
    public string Email { get; set; } = null!;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public bool IsAuthenticated => Role != UserRole.Public;
    public bool IsAdmin => Role == UserRole.Admin;
    public bool IsParticipant => Role == UserRole.Participant;

    public void RaiseIfNotAuthenticated()
    {
        if (!IsAuthenticated && (IsAdmin || IsParticipant))
        {
            throw new UnauthorizedAccessException("User is not authenticated or the role is invalid");
        }
    }   
    public void RaiseIfNotAdmin()
    {
        if (!IsAdmin || !IsAuthenticated)
        {
            throw new UnauthorizedAccessException("User is not admin");
        }
    }   
}