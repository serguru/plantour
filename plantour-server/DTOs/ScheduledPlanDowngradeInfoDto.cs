namespace plantour_server.DTOs;

public class ScheduledPlanDowngradeInfoDto
{
    public bool HasScheduledDowngrade { get; set; }
    public string? CurrentBillingPeriodEnd { get; set; }
    public string? JobId { get; set; }
    public string? CreatedAt { get; set; }
    public string? ExecutionTime { get; set; }
    public string? OldPlanPrice { get; set; }
    public string? NewPlanPrice { get; set; }
}