namespace plantour_server.DTOs;

public class PublicTemperatureRangeDto
{
    public Guid Id { get; set; }

    public string Name { get; set; } = null!;

    public int? FromTemp { get; set; }

    public int? ToTemp { get; set; }

    public string? Notes { get; set; }
}
