namespace plantour_server.DTOs;

public class TripExpenseDto
{
    public Guid Id { get; set; }
    public Guid TripUserId { get; set; }
    public string Name { get; set; } = null!;
    public string? PaymentMethod { get; set; }
    public Guid? CurrencyId { get; set; }
    public string? Currency { get; set; }
    public Guid? EffectiveCurrencyId { get; set; }
    public string? EffectiveCurrency { get; set; }
    public decimal? Rate { get; set; }
    public decimal EffectiveRate { get; set; }
    public decimal Amount { get; set; }
    public decimal AmountInTripCurrency { get; set; }
    public Guid? RecipientId { get; set; }
    public string? RecipientEmail { get; set; }
    public string? RecipientFirstName { get; set; }
    public string? RecipientLastName { get; set; }
    public string? UserEmail { get; set; }
    public string? UserFirstName { get; set; }
    public string? UserLastName { get; set; }
    public string? Notes { get; set; }
    public bool Shared { get; set; }
}