namespace plantour_server.DTOs;

public class TripUserDto
{
    public Guid Id { get; set; }


    public Guid AdminParticipantId { get; set; }
    public Guid UserId { get; set; }

    public string Email { get; set; } = null!;

    public string? FirstName { get; set; }

    public string? LastName { get; set; }

    public string? Phone { get; set; }

    public string? Notes { get; set; }

    public int TotalPacks { get; set; }
    public int TotalThings { get; set; }
    public int TotalTodos { get; set; }
    public int TotalSharedThings { get; set; }
    public int TotalSharedTodos { get; set; }
    public bool PackagingComplete { get; set; }

    public decimal? NopackWeightValue { get; set; }
    public string? NopackWeightUnit { get; set; }
    
}
