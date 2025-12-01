namespace plantour_server.DTOs;

public class UserPackageResponse
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid? CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public Guid? ParentPackageId { get; set; }
    public string? ParentPackageShortDescription { get; set; }
    public string ShortDescription { get; set; } = null!;
    public string? Description { get; set; }
    public string? Brand { get; set; }
    public string? Model { get; set; }
    public string? Color { get; set; }
    public decimal? EmptyWeightValue { get; set; }
    public Guid? WeightUnitId { get; set; }
    public string? WeightUnitName { get; set; }
    public decimal? CapacityValue { get; set; }
    public Guid? CapacityUnitId { get; set; }
    public string? CapacityUnitName { get; set; }
    public decimal? LengthValue { get; set; }
    public decimal? WidthValue { get; set; }
    public decimal? HeightValue { get; set; }
    public Guid? DimensionUnitId { get; set; }
    public string? DimensionUnitName { get; set; }
}
