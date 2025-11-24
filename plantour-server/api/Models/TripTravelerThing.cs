using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Plantour.Models;

[Table("trip_traveler_things", Schema = "plantour")]
[Index("TripTravelerId", "TravelerThingId", Name = "idx_trip_traveler_trip_traveler_id_traveler_thing_id", IsUnique = true)]
public partial class TripTravelerThing
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("trip_traveler_id")]
    public Guid TripTravelerId { get; set; }

    [Column("traveler_thing_id")]
    public Guid TravelerThingId { get; set; }

    [Column("traveler_package_id")]
    public Guid? TravelerPackageId { get; set; }

    [Column("packing_status_id")]
    public Guid? PackingStatusId { get; set; }

    [Column("packed_at")]
    public DateTime? PackedAt { get; set; }

    [ForeignKey("PackingStatusId")]
    [InverseProperty("TripTravelerThings")]
    public virtual PackingStatus? PackingStatus { get; set; }

    [ForeignKey("TravelerPackageId")]
    [InverseProperty("TripTravelerThings")]
    public virtual TravelerPackage? TravelerPackage { get; set; }

    [ForeignKey("TravelerThingId")]
    [InverseProperty("TripTravelerThings")]
    public virtual TravelerThing TravelerThing { get; set; } = null!;

    [ForeignKey("TripTravelerId")]
    [InverseProperty("TripTravelerThings")]
    public virtual TripTraveler TripTraveler { get; set; } = null!;
}
