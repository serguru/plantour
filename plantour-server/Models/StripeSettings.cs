namespace plantour_server.Models;

public class StripeSettings
{
    public string? SecretKey { get; set; }
    public string? PublishableKey { get; set; }
    public string? WebhookSigningSecret { get; set; }

    public string? SuccessUrl { get; set; }
    public string? CancelUrl { get; set; }

    public Dictionary<string, Dictionary<string, string>>? PlanPriceIds { get; set; }
}
