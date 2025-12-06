namespace plantour_server.DTOs;

public class UserThingDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }

    public string? Category { get; set; }

    public string Name { get; set; } = null!;

    public string? Units { get; set; }
    public decimal? Value { get; set; }

    public string? Notes { get; set; }

}
