namespace plantour_server.DTOs;

public class PackageCategoryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Notes { get; set; }
}
