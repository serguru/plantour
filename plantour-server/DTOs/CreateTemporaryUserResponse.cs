namespace plantour_server.DTOs;

public class CreateTemporaryUserResponse
{
    public string AccessToken { get; set; } = string.Empty;
    public DateTime AccessTokenExpiresAtUtc { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public Guid CurrentTripId { get; set; }
    public int TemporaryUserAccessTokenExpirationDays { get; set; }
    public int ItemsLimit { get; set; }
    public int ParticipantsLimit { get; set; }

    
}
