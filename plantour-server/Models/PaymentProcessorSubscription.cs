namespace plantour_server.Models;

public class PaymentProcessorSubscription
{
    public required string Id { get; set; }
    public required string Status { get; set; }
    public required string CustomerId { get; set; }
    public required string PriceId { get; set; }
    public required string CreatedAt { get; set; }
    public required string PriceName { get; set; }
    public string? BillingPeriodStart { get; set; }
    public string? BillingPeriodEnd { get; set; }
    public required string StartedAt { get; set; }
}