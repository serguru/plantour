using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Plantour.Models;

[Table("trip_travelers_j", Schema = "plantour")]
[Index("TravelerId", Name = "idx_trip_travelers_j_traveler_id")]
[Index("TripId", "TravelerId", Name = "idx_trip_travelers_j_traveler_id_trip_id", IsUnique = true)]
[Index("TripId", Name = "idx_trip_travelers_j_trip_id")]
public partial class TripTravelersJ
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("trip_id")]
    public Guid TripId { get; set; }

    [Column("traveler_id")]
    public Guid TravelerId { get; set; }

    [Column("version")]
    public int Version { get; set; }

    [Column("json_object", TypeName = "jsonb")]
    public string JsonObject { get; set; } = null!;

    [ForeignKey("TravelerId")]
    [InverseProperty("TripTravelersJs")]
    public virtual Traveler Traveler { get; set; } = null!;

    [ForeignKey("TripId")]
    [InverseProperty("TripTravelersJs")]
    public virtual TripsJ Trip { get; set; } = null!;

    [InverseProperty("TripTraveler")]
    public virtual ICollection<TripThingsJ> TripThingsJs { get; set; } = new List<TripThingsJ>();
}
