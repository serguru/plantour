namespace plantour_server.DTOs;

public class GenerateTripAiImprovementsResponseDto
{
    public List<TripImprovementDto> Improvements { get; set; } = [];
    public int DeletedExistingCount { get; set; }
    public bool SharedEntitiesIncluded { get; set; }
    public string ScopeSummary { get; set; } = string.Empty;
}