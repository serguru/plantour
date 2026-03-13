namespace plantour_server.DTOs;

public class DashboardTripDto
{
    public Guid Id { get; set; }
    public string TripStatus { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? Notes { get; set; }
    public string? FromTo { get; set; }
    public bool CurrentUserIncluded { get; set; }
    public int DaysLeft { get; set; }
    public string DaysLeftText { get; set; } = null!;
}
public class DashboardUserTripDto
{
    public Guid Id { get; set; }
    public int Packs { get; set; }
    public int Items { get; set; }
    public int Todos { get; set; }
    public int SharedTotal { get; set; }
    public int SharedAssigned { get; set; }
    public int SharedPending { get; set; }
    public int SharedOverdue { get; set; }
    public int SharedSuccess { get; set; }
    public int SharedFailure { get; set; }
    public int SharedTodosTotal { get; set; }
    public int SharedTodosAssigned { get; set; }
    public int SharedTodosPending { get; set; }
    public int SharedTodosOverdue { get; set; }
    public int SharedTodosSuccess { get; set; }
    public int SharedTodosFailure { get; set; }
    public string WeightStr { get; set; } = null!;
    
}

public class DashboardAllUsersTripDto
{
    public Guid Id { get; set; }
    public int Participants { get; set; }
    public int Packs { get; set; }
    public int SharedTotal { get; set; }
    public int SharedAssigned { get; set; }
    public int SharedPending { get; set; }
    public int SharedOverdue { get; set; }
    public int SharedSuccess { get; set; }
    public int SharedFailure { get; set; }
    public int SharedTodosTotal { get; set; }
    public int SharedTodosAssigned { get; set; }
    public int SharedTodosPending { get; set; }
    public int SharedTodosOverdue { get; set; }
    public int SharedTodosSuccess { get; set; }
    public int SharedTodosFailure { get; set; }
    public string WeightStr { get; set; } = null!;
    public int PackingProgress { get; set; }
    
    
}
