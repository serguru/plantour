namespace plantour_server.Models;

public class UpdatePlanPriceRequest
{
    public string OldPlanPrice { get; set; } = null!;
    public string NewPlanPrice { get; set; } = null!;
}