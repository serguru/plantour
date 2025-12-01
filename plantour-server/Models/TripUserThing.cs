using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.Models;

[Table("trip_user_things", Schema = "plantour")]
[Index("TripUserId", "UserThingId", Name = "idx_trip_user_trip_user_id_user_thing_id", IsUnique = true)]
public partial class TripUserThing
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("trip_user_id")]
    public Guid TripUserId { get; set; }

    [Column("user_thing_id")]
    public Guid UserThingId { get; set; }

    [Column("trip_user_package_id")]
    public Guid? TripUserPackageId { get; set; }

    [Column("qty")]
    public int Qty { get; set; }

    [Column("packing_status_id")]
    public Guid? PackingStatusId { get; set; }

    [Column("packed_at")]
    public DateTime? PackedAt { get; set; }

    [ForeignKey("PackingStatusId")]
    [InverseProperty("TripUserThings")]
    public virtual PackingStatus? PackingStatus { get; set; }

    [ForeignKey("TripUserId")]
    [InverseProperty("TripUserThings")]
    public virtual TripUser TripUser { get; set; } = null!;

    [ForeignKey("TripUserPackageId")]
    [InverseProperty("TripUserThings")]
    public virtual TripUserPackage? TripUserPackage { get; set; }

    [ForeignKey("UserThingId")]
    [InverseProperty("TripUserThings")]
    public virtual UserThing UserThing { get; set; } = null!;
}
