using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Plantour.Models;

[Table("trip_things_j", Schema = "plantour")]
[Index("PackageId", Name = "idx_trip_things_j_package_id")]
[Index("ThingId", Name = "idx_trip_things_j_trip_thing_id")]
[Index("TripTravelerId", Name = "idx_trip_things_j_trip_traveler_id")]
[Index("TripTravelerId", "ThingId", Name = "idx_trip_things_j_trip_traveler_id_thing_id", IsUnique = true)]
public partial class TripThingsJ
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("trip_traveler_id")]
    public Guid TripTravelerId { get; set; }

    [Column("thing_id")]
    public Guid ThingId { get; set; }

    [Column("package_id")]
    public Guid? PackageId { get; set; }

    [Column("version")]
    public int Version { get; set; }

    [Column("json_object", TypeName = "jsonb")]
    public string JsonObject { get; set; } = null!;

    [ForeignKey("PackageId")]
    [InverseProperty("TripThingsJs")]
    public virtual PackagesJ? Package { get; set; }

    [ForeignKey("ThingId")]
    [InverseProperty("TripThingsJs")]
    public virtual ThingsJ Thing { get; set; } = null!;

    [ForeignKey("TripTravelerId")]
    [InverseProperty("TripThingsJs")]
    public virtual TripTravelersJ TripTraveler { get; set; } = null!;
}
