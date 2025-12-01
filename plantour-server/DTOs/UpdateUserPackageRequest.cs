using System.ComponentModel.DataAnnotations;

namespace plantour_server.DTOs;

public class UpdateUserPackageRequest
{
    public Guid? CategoryId { get; set; }
    public Guid? ParentPackageId { get; set; }

    [Required]
    [StringLength(200)]
    public string ShortDescription { get; set; } = null!;

    public string? Description { get; set; }

    [StringLength(100)]
    public string? Brand { get; set; }

    [StringLength(100)]
    public string? Model { get; set; }

    [StringLength(50)]
    public string? Color { get; set; }

    public decimal? EmptyWeightValue { get; set; }
    public Guid? WeightUnitId { get; set; }
    public decimal? CapacityValue { get; set; }
    public Guid? CapacityUnitId { get; set; }
    public decimal? LengthValue { get; set; }
    public decimal? WidthValue { get; set; }
    public decimal? HeightValue { get; set; }
    public Guid? DimensionUnitId { get; set; }
}
