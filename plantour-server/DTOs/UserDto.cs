namespace plantour_server.DTOs;

public class UserDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = null!;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Phone { get; set; }
    public string? Notes { get; set; }
    public bool HasPassword { get; set; }
    public bool HasGoogleLinked { get; set; }
    public bool HasFacebookLinked { get; set; }

}
