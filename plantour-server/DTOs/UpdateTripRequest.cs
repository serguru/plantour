using System.ComponentModel.DataAnnotations;

namespace plantour_server.DTOs;

public class UpdateTripRequest
{
    [Required]
    public Guid Id { get; set; }
    
    public string? TripStatus { get; set; }
    
    [Required]
    [StringLength(200)]
    public string Name { get; set; } = null!;
    
    public string? Notes { get; set; }
    
    public DateOnly? StartDate { get; set; }
    
    public DateOnly? EndDate { get; set; }
  
}
