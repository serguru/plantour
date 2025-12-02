using System.ComponentModel.DataAnnotations;

namespace plantour_server.DTOs;

public class CreateUserThingRequest
{
    [Required]
    public Guid UserId { get; set; }
    
    public Guid? CategoryId { get; set; }
    
    [Required]
    [StringLength(200)]
    public string ShortDescription { get; set; } = null!;
    
    public string? Description { get; set; }
}
