using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("trip_shared_things", Schema = "plantour")]
[Index("TripId", "Name", Name = "idx_trip_shared_things_trip_id_name", IsUnique = true)]
public partial class TripSharedThing
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("trip_id")]
    public Guid TripId { get; set; }

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

    [Column("notes")]
    public string? Notes { get; set; }

    [Column("assigned_by_id")]
    public Guid AssignedById { get; set; }

    [Column("assigned_to_id")]
    public Guid? AssignedToId { get; set; }

    [Column("assigned_thing_id")]
    public Guid? AssignedThingId { get; set; }

    [Column("assigned_at")]
    public DateTime? AssignedAt { get; set; }

    [Column("assigned_deadline")]
    public DateTime? AssignedDeadline { get; set; }

    [ForeignKey("AssignedById")]
    [InverseProperty("TripSharedThingAssignedBies")]
    public virtual TripUser AssignedBy { get; set; } = null!;

    [ForeignKey("AssignedThingId")]
    [InverseProperty("TripSharedThings")]
    public virtual TripUserThing? AssignedThing { get; set; }

    [ForeignKey("AssignedToId")]
    [InverseProperty("TripSharedThingAssignedTos")]
    public virtual TripUser? AssignedTo { get; set; }

    [ForeignKey("TripId")]
    [InverseProperty("TripSharedThings")]
    public virtual Trip Trip { get; set; } = null!;
}
