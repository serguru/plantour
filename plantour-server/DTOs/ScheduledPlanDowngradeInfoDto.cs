namespace plantour_server.DTOs;

public class ScheduledPlanDowngradeInfoDto
{
    public bool HasScheduledDowngrade { get; set; }
    public Guid? JobId { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? ExecutionTime { get; set; }
    public string? OldPlanPrice { get; set; }
    public string? NewPlanPrice { get; set; }
}