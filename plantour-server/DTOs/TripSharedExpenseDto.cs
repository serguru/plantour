namespace plantour_server.DTOs;

public class TripSharedExpenseDto
{
    public Guid Id { get; set; }
    public Guid TripId { get; set; }
    public string? Category { get; set; }
    public string Name { get; set; } = null!;
    public decimal Amount { get; set; }
    public string? Notes { get; set; }
}