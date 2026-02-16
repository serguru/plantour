namespace plantour_server.DTOs;

public class UpdateCustomerSubscriptionRequest
{
    public Guid Id { get; set; }
    public string StripeSubscriptionId { get; set; } = null!;
    public string SubscriptionStatus { get; set; } = null!;
    public Guid PlanId { get; set; }
    public DateTime CurrentPeriodStart { get; set; }
    public DateTime CurrentPeriodEnd { get; set; }
    public bool? CancelAtPeriodEnd { get; set; }
}
