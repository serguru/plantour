using System.ComponentModel.DataAnnotations;

namespace plantour_server.DTOs;

public class UpdateTripExpenseRequest : IValidatableObject
{
    public Guid Id { get; set; }
    public Guid TripId { get; set; }

    [Required]
    [StringLength(200)]
    public string Name { get; set; } = null!;

    [StringLength(200)]
    public string? PaymentMethod { get; set; }

    public Guid? CurrencyId { get; set; }

    [Range(typeof(decimal), "0.00000001", "79228162514264337593543950335")]
    public decimal? Rate { get; set; }

    [Range(typeof(decimal), "0.01", "79228162514264337593543950335")]
    public decimal Amount { get; set; }

    public Guid? RecipientId { get; set; }

    public bool Shared { get; set; }

    public string? Notes { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (Amount <= 0)
        {
            yield return new ValidationResult("Amount must be greater than zero.", [nameof(Amount)]);
        }

        if (Rate.HasValue && Rate.Value <= 0)
        {
            yield return new ValidationResult("Rate must be greater than zero.", [nameof(Rate)]);
        }
    }
}