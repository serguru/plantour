namespace plantour_server.DTOs;

public class PackDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Notes { get; set; }
    public bool IsTargeted { get; set; } = false;
}
