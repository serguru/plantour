using System.ComponentModel.DataAnnotations;

namespace plantour_server.DTOs;

public class UpdateItineraryPartRequest : IValidatableObject
{
    public Guid Id { get; set; }
    public Guid TripId { get; set; }

    [Required]
    [StringLength(200)]
    public string Name { get; set; } = null!;

    [StringLength(200)]
    public string? Category { get; set; }

    [StringLength(500)]
    public string? Address { get; set; }

    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public string? Notes { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (EndDate.HasValue && StartDate > EndDate.Value)
        {
            yield return new ValidationResult(
                "StartDate cannot be later than EndDate.",
                [nameof(StartDate), nameof(EndDate)]);
        }

        foreach (var validationResult in TodoRequestValidation.ValidateCoordinates(
                     Latitude,
                     Longitude,
                     nameof(Latitude),
                     nameof(Longitude)))
        {
            yield return validationResult;
        }
    }
}