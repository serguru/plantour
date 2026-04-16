namespace plantour_server.Models;

public class PaymentProcessorProduct
{
    public required string Id { get; set; }
    public required string Name { get; set; }
    public required string Description { get; set; }
    public required List<PaymentProcessorPrice> Prices { get; set; }
}