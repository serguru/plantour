namespace plantour_maintenance_server.DTOs;

public sealed class PlantourUserRowDto
{
    public Guid Id { get; init; }
    public required string Email { get; init; }
    public string? FullName { get; init; }
    public required string Role { get; init; }
    public string? Plan { get; init; }
    public string? PaddleCustomerId { get; init; }
    public string? PaddleCustomerStatus { get; init; }
    public string? PaddleSubscriptionId { get; init; }
    public string? PaddleSubscriptionStatus { get; init; }
    public string? PaddlePriceId { get; init; }
    public bool Temporary { get; init; }
    public DateTime DateJoined { get; init; }
    public bool HasActiveSubscription { get; init; }
    public DateTime? LatestPlanStartedAt { get; init; }
    public DateTime? LastVisitAt { get; init; }
    public int TripsCount { get; init; }
    public int ItemsCount { get; init; }
    public int TodosCount { get; init; }
    public int ExpensesCount { get; init; }
    public int TravelersCount { get; init; }
    public string? PaymentsTotal { get; init; }
}