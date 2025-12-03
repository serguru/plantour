using System.ComponentModel.DataAnnotations;

namespace plantour_server.DTOs;

public class CreateTripRequest
{
    [Required]
    public Guid OwnerId { get; set; }
    
    public Guid? TripStatusId { get; set; }
    
    [Required]
    [StringLength(200)]
    public string ShortDescription { get; set; } = null!;
    
    public string? Description { get; set; }
    
    public DateOnly? StartDate { get; set; }
    
    public DateOnly? EndDate { get; set; }
    
    public bool? RequireWeight { get; set; }
}
