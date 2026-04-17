namespace plantour_server.Models;

public class PaymentProcessorCheckoutRequest
{
    public required string PriceId { get; set; }
    public string? Email { get; set; }
    public string? RedirectUrl { get; set; }
}