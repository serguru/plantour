using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("trip_user_things", Schema = "plantour")]
[Index("TripUserId", Name = "idx_trip_user_things_trip_user_id")]
public partial class TripUserThing
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("trip_user_id")]
    public Guid TripUserId { get; set; }

    [Column("category")]
    [StringLength(50)]
    public string? Category { get; set; }

    [Column("name")]
    [StringLength(200)]
    public string Name { get; set; } = null!;

    [Column("units")]
    [StringLength(50)]
    public string? Units { get; set; }

    [Column("value")]
    [Precision(10, 3)]
    public decimal? Value { get; set; }

    [Column("trip_user_package_id")]
    public Guid? TripUserPackageId { get; set; }

    [Column("packing_status")]
    [StringLength(50)]
    public string? PackingStatus { get; set; }

    [Column("packed_at")]
    public DateTime? PackedAt { get; set; }

    [ForeignKey("TripUserId")]
    [InverseProperty("TripUserThings")]
    public virtual TripUser TripUser { get; set; } = null!;

    [ForeignKey("TripUserPackageId")]
    [InverseProperty("TripUserThings")]
    public virtual TripUserPackage? TripUserPackage { get; set; }
}
