using System.ComponentModel.DataAnnotations;

namespace plantour_server.DTOs;

public class UpdateUserPackageRequest
{
    public Guid? CategoryId { get; set; }
    
    [StringLength(200)]
    public string? ShortDescription { get; set; }
    
    public string? Description { get; set; }
}
