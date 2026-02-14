namespace plantour_server.DTOs;

public class LandingDto
{
    public string GuestPlanName { get; set; } = null!;
    public string TrialPlanName { get; set; } = null!;
    public string BasePlanName { get; set; } = null!;
    public string ProPlanName { get; set; } = null!;

    public string BasePlanMonthly { get; set; } = null!;
    public string BasePlanYearly { get; set; } = null!;

    public string ProPlanMonthly { get; set; } = null!;
    public string ProPlanYearly { get; set; } = null!;
    public string GuestPlanDurationDays { get; set; } = null!;

    public string BaseMonthlyPriceUrl { get; set; } = null!;
    public string BaseYearlyPriceUrl { get; set; } = null!;
    public string ProMonthlyPriceUrl { get; set; } = null!;
    public string ProYearlyPriceUrl { get; set; } = null!;

}
