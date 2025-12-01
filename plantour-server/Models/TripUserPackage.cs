using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.Models;

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

    [Column("packing_status_id")]
    public Guid? PackingStatusId { get; set; }

    [Column("packed_at")]
    public DateTime? PackedAt { get; set; }

    [Column("label")]
    [StringLength(100)]
    public string? Label { get; set; }

    [Column("packing_list_included")]
    public bool PackingListIncluded { get; set; }

    [ForeignKey("PackingStatusId")]
    [InverseProperty("TripUserPackages")]
    public virtual PackingStatus? PackingStatus { get; set; }

    [ForeignKey("TripUserId")]
    [InverseProperty("TripUserPackages")]
    public virtual TripUser TripUser { get; set; } = null!;

    [InverseProperty("TripUserPackage")]
    public virtual ICollection<TripUserThing> TripUserThings { get; set; } = new List<TripUserThing>();

    [ForeignKey("UserPackageId")]
    [InverseProperty("TripUserPackages")]
    public virtual UserPackage? UserPackage { get; set; }
}
