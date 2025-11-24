using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Plantour.Models;

[Table("trip_travelers", Schema = "plantour")]
[Index("TripId", "TravelerId", Name = "idx_trip_travelers_trip_id_traveler_id", IsUnique = true)]
[Index("AccessCode", Name = "trip_travelers_access_code_key", IsUnique = true)]
public partial class TripTraveler
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("trip_id")]
    public Guid TripId { get; set; }

    [Column("traveler_id")]
    public Guid TravelerId { get; set; }

    [Column("access_code")]
    [StringLength(8)]
    public string AccessCode { get; set; } = null!;

    [ForeignKey("TravelerId")]
    [InverseProperty("TripTravelers")]
    public virtual Traveler Traveler { get; set; } = null!;

    [ForeignKey("TripId")]
    [InverseProperty("TripTravelers")]
    public virtual Trip Trip { get; set; } = null!;

    [InverseProperty("TripTraveler")]
    public virtual ICollection<TripTravelerThing> TripTravelerThings { get; set; } = new List<TripTravelerThing>();
}
