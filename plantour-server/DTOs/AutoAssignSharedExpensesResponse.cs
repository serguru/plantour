namespace plantour_server.DTOs;

public class AutoAssignSharedExpensesResponse
{
    public decimal TotalAmount { get; set; }
    public decimal AlreadyAssignedAmount { get; set; }
    public decimal AssignedAmount { get; set; }
    public decimal PerParticipantAmount { get; set; }
    public int ParticipantsCount { get; set; }
}