using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.Models;

[Table("user_packages", Schema = "plantour")]
[Index("CategoryId", Name = "idx_user_packages_category_id")]
[Index("ParentPackageId", Name = "idx_user_packages_parent_package_id")]
public partial class UserPackage
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
    [InverseProperty("UserPackageCapacityUnits")]
    public virtual Unit? CapacityUnit { get; set; }

    [ForeignKey("CategoryId")]
    [InverseProperty("UserPackages")]
    public virtual UserPackageCategory Category { get; set; } = null!;

    [ForeignKey("DimensionUnitId")]
    [InverseProperty("UserPackageDimensionUnits")]
    public virtual Unit? DimensionUnit { get; set; }

    [InverseProperty("ParentPackage")]
    public virtual ICollection<UserPackage> InverseParentPackage { get; set; } = new List<UserPackage>();

    [ForeignKey("ParentPackageId")]
    [InverseProperty("InverseParentPackage")]
    public virtual UserPackage? ParentPackage { get; set; }

    [InverseProperty("UserPackage")]
    public virtual ICollection<TripUserThing> TripUserThings { get; set; } = new List<TripUserThing>();

    [ForeignKey("WeightUnitId")]
    [InverseProperty("UserPackageWeightUnits")]
    public virtual Unit? WeightUnit { get; set; }
}
