using System.ComponentModel.DataAnnotations;

namespace plantour_server.DTOs;

public class UpdateUserPackageRequest
{
    public Guid Id { get; set; }
    
    public string Name { get; set; } = null!;
    
    public string? Description { get; set; }
}
