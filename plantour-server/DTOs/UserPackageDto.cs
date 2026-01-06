namespace plantour_server.DTOs;

public class PackageDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public bool IsTargeted { get; set; } = false;
}
