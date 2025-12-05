using System.ComponentModel.DataAnnotations;

namespace plantour_server.DTOs;

public class CreateUserPackageRequest
{
    [Required]
    public Guid UserId { get; set; }
    
    [Required]
    [StringLength(200)]
    public string ShortDescription { get; set; } = null!;
    
    public string? Description { get; set; }
}
