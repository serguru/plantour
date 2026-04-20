namespace plantour_maintenance_server.DTOs;

public sealed class ComprehensiveUserDto
{
    public Guid Id { get; init; }
    public required string Email { get; init; }
    public string? FirstName { get; init; }
    public string? LastName { get; init; }
    public string? Phone { get; init; }
    public string? GoogleSub { get; init; }
    public string? FacebookUserId { get; init; }
    public string? Notes { get; init; }
    public DateTime CreatedAt { get; init; }
    public bool Temporary { get; init; }
    public string? ParticipantCode { get; init; }
    public string? PaymentProcessorSubscriptionId { get; init; }
    public Guid AccessTypeId { get; init; }
    public Guid? CurrencyId { get; init; }
    
    // Basic collections as object arrays - will be serialized as JSON
    public object[] UserSettings { get; init; } = [];
    public object[] UserKeys { get; init; } = [];
    public object[] UserThings { get; init; } = [];
    public object[] UserTodos { get; init; } = [];
    public object[] UserPackages { get; init; } = [];
    public object[] AdminsParticipantAdmins { get; init; } = [];
    public object[] AdminsParticipantParticipants { get; init; } = [];
    public object[] AiPrompts { get; init; } = [];
    public object[] Trips { get; init; } = [];
    
    // Indirect relationships
    public object[] TripUsers { get; init; } = [];
    public object[] TripUserThings { get; init; } = [];
    public object[] TripUserTodos { get; init; } = [];
    public object[] TripUserExpenses { get; init; } = [];
    public object[] TripUserPackages { get; init; } = [];
    
    // Other relationships
    public object[] ApiVisits { get; init; } = [];
    public object[] ContactSubmissions { get; init; } = [];
    public object[] Logs { get; init; } = [];
    
    // Counts for quick reference
    public int TotalTripsCount { get; init; }
    public int TotalThingsCount { get; init; }
    public int TotalTodosCount { get; init; }
    public int TotalExpensesCount { get; init; }
    public int TotalPackagesCount { get; init; }
}