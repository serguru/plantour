namespace plantour_server.DTOs;

public class UpdateTripPackageRequest
{
    public Guid Id { get; set; }
    public Guid? ParentPackageId { get; set; }
    public string Name { get; set; } = null!;
    public string? Label { get; set; }
    public string? Notes { get; set; }
    public string? PackingStatus { get; set; }
    public DateTime? PackedAt { get; set; }
    public bool PackingListIncluded { get; set; }
    public decimal? WeightValue { get; set; }
    public string? WeightUnit { get; set; }
}
