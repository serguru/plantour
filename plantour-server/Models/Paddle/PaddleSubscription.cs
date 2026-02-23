namespace plantour_server.Models;

public class PaddleSubscription
{
    public required string Id { get; set; }
    public required string Status { get; set; }
    public required string CustomerId { get; set; }
    public required string  PriceId { get; set; }
    public required string CreatedAt { get; set; }
    
}
