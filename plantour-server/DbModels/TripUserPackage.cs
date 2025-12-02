using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("trip_user_packages", Schema = "plantour")]
[Index("TripUserId", "UserPackageId", Name = "idx_trip_user_packages_trip_user_id_user_package_id", IsUnique = true)]
public partial class TripUserPackage
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("trip_user_id")]
    public Guid TripUserId { get; set; }

    [Column("user_package_id")]
    public Guid? UserPackageId { get; set; }

    [Column("parent_package_id")]
    public Guid? ParentPackageId { get; set; }

    [Column("packing_status_id")]
    public Guid? PackingStatusId { get; set; }

    [Column("packed_at")]
    public DateTime? PackedAt { get; set; }

    [Column("label")]
    [StringLength(100)]
    public string? Label { get; set; }

    [Column("packing_list_included")]
    public bool PackingListIncluded { get; set; }

    [Column("weight_value")]
    [Precision(10, 3)]
    public decimal? WeightValue { get; set; }

    [Column("weight_unit_id")]
    public Guid? WeightUnitId { get; set; }

    [InverseProperty("ParentPackage")]
    public virtual ICollection<TripUserPackage> InverseParentPackage { get; set; } = new List<TripUserPackage>();

    [ForeignKey("PackingStatusId")]
    [InverseProperty("TripUserPackages")]
    public virtual PackingStatus? PackingStatus { get; set; }

    [ForeignKey("ParentPackageId")]
    [InverseProperty("InverseParentPackage")]
    public virtual TripUserPackage? ParentPackage { get; set; }

    [ForeignKey("TripUserId")]
    [InverseProperty("TripUserPackages")]
    public virtual TripUser TripUser { get; set; } = null!;

    [InverseProperty("TripUserPackage")]
    public virtual ICollection<TripUserThing> TripUserThings { get; set; } = new List<TripUserThing>();

    [ForeignKey("UserPackageId")]
    [InverseProperty("TripUserPackages")]
    public virtual UserPackage? UserPackage { get; set; }

    [ForeignKey("WeightUnitId")]
    [InverseProperty("TripUserPackages")]
    public virtual Unit? WeightUnit { get; set; }
}
