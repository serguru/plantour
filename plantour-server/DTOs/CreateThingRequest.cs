using System.ComponentModel.DataAnnotations;

namespace plantour_server.DTOs;

public class CreateThingRequest
{
    public string? Category { get; set; }

    public string Name { get; set; } = null!;

    public string? Units { get; set; }
    public decimal? Value { get; set; }

    public string? Notes { get; set; }

    public bool Common { get; set; }

}
