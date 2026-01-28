namespace plantour_server.DTOs;

public class PublicTemplateThingDto
{
    public Guid ThingId { get; set; }

    public string ThingName { get; set; } = null!;

    public string? Category { get; set; }

    public string? Units { get; set; }

    public decimal? Value { get; set; }

    public string? ThingNotes { get; set; }

    public Guid TemplateId { get; set; }

    public string TemplateName { get; set; } = null!;

    public string ActivityName { get; set; } = null!;

    public string? TemperatureRangeName { get; set; }

    public int? FromTemp { get; set; }

    public int? ToTemp { get; set; }

    public string? AgeRangeName { get; set; }

    public int? FromAge { get; set; }

    public int? ToAge { get; set; }
}
