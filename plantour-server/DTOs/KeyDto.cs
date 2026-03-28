namespace plantour_server.DTOs;

public class KeyDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string Key { get; set; } = null!;
    public bool Active { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? Notes { get; set; }
}