namespace plantour_server.DTOs;

public class PlanDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string? PaymentProcessorProductId { get; set; }
    public string? Notes { get; set; }
    public bool? Active { get; set; }
    public DateTime CreatedAt { get; set; }
    public int? AllowedItems { get; set; }
    public int? AllowedTravelers { get; set; }
    public int? AllowedTodos { get; set; }
    public int? AllowedExpenses { get; set; }
    public int? AllowedItineraryParts { get; set; }
    public int? AllowedActivities { get; set; }
    public int? AllowedAiPrompts { get; set; }
    public bool ExtendedAiAllowed { get; set; }
    public virtual ICollection<PriceDto> Prices { get; set; } = new List<PriceDto>();
}
