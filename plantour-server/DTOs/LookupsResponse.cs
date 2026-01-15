namespace plantour_server.DTOs;

public class LookupsResponse
{
    public IEnumerable<PackingStatusDto> PackingStatuses { get; set; } = null!;
    public IEnumerable<CommunicationTypeDto> CommunicationTypes { get; set; } = null!;
    public IEnumerable<ThingCategoryDto> ThingCategories { get; set; } = null!;
    public IEnumerable<TripStatusDto> TripStatuses { get; set; } = null!;
    public IEnumerable<UnitDto> Units { get; set; } = null!;
}
