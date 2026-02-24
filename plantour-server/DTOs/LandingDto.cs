using plantour_server.DbModels;

namespace plantour_server.DTOs;

public class LandingDto
{
    public List<PlanDto> Plans { get; set; } = [];
    public string GuestPlanDurationDays { get; set; } = null!;
}
