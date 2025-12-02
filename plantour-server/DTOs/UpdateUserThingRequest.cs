using System.ComponentModel.DataAnnotations;

namespace plantour_server.DTOs;

public class UpdateUserThingRequest
{
    public Guid ThingId { get; set; }
    public Guid? CategoryId { get; set; }
    
    public string ShortDescription { get; set; } = null!;
    
    public string? Description { get; set; }
}
