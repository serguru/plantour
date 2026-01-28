namespace plantour_server.DTOs;

public class PublicAgeRangeDto
{
    public Guid Id { get; set; }

    public string Name { get; set; } = null!;

    public int FromAge { get; set; }

    public int? ToAge { get; set; }

    public string? Notes { get; set; }
}
