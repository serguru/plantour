namespace plantour_server.Models;

public class PaddlePrice
{
    public required string Id { get; set; }
    public required string ProductId { get; set; }
    public required string  Name { get; set; }
    public required string  Description { get; set; }
    public required string Type { get; set; }
    public required string BillingCycleInterval { get; set; }
    public required int BillingCycleFrequency { get; set; }
    public required int UnitPriceAmount { get; set; }
}
