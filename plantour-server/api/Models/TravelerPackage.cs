using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Plantour.Models;

[Table("traveler_packages", Schema = "plantour")]
[Index("CategoryId", Name = "idx_traveler_packages_category_id")]
[Index("ParentPackageId", Name = "idx_traveler_packages_parent_package_id")]
public partial class TravelerPackage
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("category_id")]
    public Guid CategoryId { get; set; }

    [Column("parent_package_id")]
    public Guid? ParentPackageId { get; set; }

    [Column("short_description")]
    [StringLength(200)]
    public string ShortDescription { get; set; } = null!;

    [Column("description")]
    public string? Description { get; set; }

    [Column("brand")]
    [StringLength(100)]
    public string? Brand { get; set; }

    [Column("model")]
    [StringLength(100)]
    public string? Model { get; set; }

    [Column("color")]
    [StringLength(50)]
    public string? Color { get; set; }

    [Column("empty_weight_value")]
    [Precision(10, 3)]
    public decimal? EmptyWeightValue { get; set; }

    [Column("weight_unit_id")]
    public Guid? WeightUnitId { get; set; }

    [Column("capacity_value")]
    [Precision(10, 2)]
    public decimal? CapacityValue { get; set; }

    [Column("capacity_unit_id")]
    public Guid? CapacityUnitId { get; set; }

    [Column("length_value")]
    [Precision(10, 2)]
    public decimal? LengthValue { get; set; }

    [Column("width_value")]
    [Precision(10, 2)]
    public decimal? WidthValue { get; set; }

    [Column("height_value")]
    [Precision(10, 2)]
    public decimal? HeightValue { get; set; }

    [Column("dimension_unit_id")]
    public Guid? DimensionUnitId { get; set; }

    [ForeignKey("CapacityUnitId")]
    [InverseProperty("TravelerPackageCapacityUnits")]
    public virtual Unit? CapacityUnit { get; set; }

    [ForeignKey("CategoryId")]
    [InverseProperty("TravelerPackages")]
    public virtual TravelerPackageCategory Category { get; set; } = null!;

    [ForeignKey("DimensionUnitId")]
    [InverseProperty("TravelerPackageDimensionUnits")]
    public virtual Unit? DimensionUnit { get; set; }

    [InverseProperty("ParentPackage")]
    public virtual ICollection<TravelerPackage> InverseParentPackage { get; set; } = new List<TravelerPackage>();

    [ForeignKey("ParentPackageId")]
    [InverseProperty("InverseParentPackage")]
    public virtual TravelerPackage? ParentPackage { get; set; }

    [InverseProperty("TravelerPackage")]
    public virtual ICollection<TripTravelerThing> TripTravelerThings { get; set; } = new List<TripTravelerThing>();

    [ForeignKey("WeightUnitId")]
    [InverseProperty("TravelerPackageWeightUnits")]
    public virtual Unit? WeightUnit { get; set; }
}
