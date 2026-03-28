using System.ComponentModel.DataAnnotations;

namespace plantour_server.DTOs;

public class UpdateTripSharedExpenseRequest : IValidatableObject
{
    public Guid Id { get; set; }
    public Guid TripId { get; set; }

    [StringLength(200)]
    public string? Category { get; set; }

    [Required]
    [StringLength(200)]
    public string Name { get; set; } = null!;

    [StringLength(200)]
    public string? PaymentMethod { get; set; }

    public Guid? CurrencyId { get; set; }

    [Range(typeof(decimal), "0.01", "79228162514264337593543950335")]
    public decimal Amount { get; set; }

    public string? Notes { get; set; }
    public Guid? AssignedToId { get; set; }
    public Guid? AssignedExpenseId { get; set; }
    public DateTime? AssignedDeadline { get; set; }
    public bool Rejected { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (Amount <= 0)
        {
            yield return new ValidationResult("Amount must be greater than zero.", [nameof(Amount)]);
        }
    }
}