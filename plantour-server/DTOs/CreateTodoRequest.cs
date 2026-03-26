using System.ComponentModel.DataAnnotations;

namespace plantour_server.DTOs;

public class CreateTodoRequest : IValidatableObject
{
    [StringLength(200)]
    public string? Category { get; set; }

    [Required]
    [StringLength(200)]
    public string Name { get; set; } = null!;

    [StringLength(500)]
    public string? Address { get; set; }

    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }

    public string? Notes { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        return TodoRequestValidation.ValidateCoordinates(
            Latitude,
            Longitude,
            nameof(Latitude),
            nameof(Longitude));
    }
}