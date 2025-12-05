using System.ComponentModel.DataAnnotations;

namespace plantour_server.DTOs;

public class UpdateUserPackageRequest
{
    public Guid PackageId { get; set; }
    
    public string ShortDescription { get; set; } = null!;
    
    public string? Description { get; set; }
}
