namespace plantour_server.DTOs;

public class VTemplateThingsFullDto
{
    public Guid? Id { get; set; }

    public string? Name { get; set; }

    public string? Category { get; set; }

    public string? Units { get; set; }

    public decimal? Value { get; set; }

    public string? ThingNotes { get; set; }

    public Guid? TemplateId { get; set; }

    public string? TemplateName { get; set; }

    public string? ActivityName { get; set; }

    public string? TemperatureRangeName { get; set; }

    public int? Fromtemp { get; set; }

    public int? Totemp { get; set; }

    public string? AgeRangeName { get; set; }

    public int? Fromage { get; set; }

    public int? Toage { get; set; }

    public bool IsTargeted { get; set; } = false;

}
