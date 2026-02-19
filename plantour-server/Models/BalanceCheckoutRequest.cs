namespace plantour_server.Models;

public class BalanceCheckoutRequest
{
    public required string PlanId { get; set; }
    public required string PlanName { get; set; }
    public required string Description { get; set; }
    public required long Price { get; set; }
    public required string ReturnUrl { get; set; }
}