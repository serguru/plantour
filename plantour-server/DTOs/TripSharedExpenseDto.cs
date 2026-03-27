namespace plantour_server.DTOs;

public class TripSharedExpenseDto
{
    public Guid Id { get; set; }
    public Guid TripId { get; set; }
    public string? Category { get; set; }
    public string Name { get; set; } = null!;
    public string? PaymentMethod { get; set; }
    public Guid? CurrencyId { get; set; }
    public string? Currency { get; set; }
    public Guid? EffectiveCurrencyId { get; set; }
    public string? EffectiveCurrency { get; set; }
    public decimal Amount { get; set; }
    public decimal? AmountInTripCurrency { get; set; }
    public string? Notes { get; set; }
    public Guid? AssignedToId { get; set; }
    public Guid? AssignedExpenseId { get; set; }
    public DateTime? AssignedAt { get; set; }
    public DateTime? AssignedDeadline { get; set; }
    public bool Rejected { get; set; }
    public string? AssigneeEmail { get; set; }
    public string? AssigneeFirstName { get; set; }
    public string? AssigneeLastName { get; set; }
    public bool IsTargeted { get; set; }
}