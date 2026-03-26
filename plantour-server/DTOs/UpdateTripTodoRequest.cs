using System.ComponentModel.DataAnnotations;

namespace plantour_server.DTOs;

public class UpdateTripTodoRequest : IValidatableObject
{
    public Guid Id { get; set; }
    public Guid TripId { get; set; }

    [StringLength(200)]
    public string? Category { get; set; }

    [Required]
    [StringLength(200)]
    public string Name { get; set; } = null!;

    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }

    [StringLength(500)]
    public string? Address { get; set; }

    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }

    public string? Notes { get; set; }
    public string? Finished { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        return TodoRequestValidation.Validate(
            StartDate,
            EndDate,
            Latitude,
            Longitude,
            nameof(StartDate),
            nameof(EndDate),
            nameof(Latitude),
            nameof(Longitude));
    }
}