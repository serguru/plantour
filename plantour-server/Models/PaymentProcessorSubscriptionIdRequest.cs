namespace plantour_server.Models;

public class PaymentProcessorSubscriptionIdRequest
{
    public required string Email { get; set; }
    public required string PriceId { get; set; }
}