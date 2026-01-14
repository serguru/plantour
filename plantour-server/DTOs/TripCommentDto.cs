namespace plantour_server.DTOs;

public class TripCommentDto
{
    public Guid Id { get; set; }
    public string Comment { get; set; } = null!;
    public DateTime PublishedAt { get; set; }
    public Guid UserId { get; set; } = Guid.Empty;
    public string? FirstName { get; set; } = null!;
    public string? LastName { get; set; } = null!;
    public string Email { get; set; } = null!;
}
