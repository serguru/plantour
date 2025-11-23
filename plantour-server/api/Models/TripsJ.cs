using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Plantour.Models;

[Table("trips_j", Schema = "plantour")]
[Index("UserId", Name = "idx_trips_j_user_id")]
public partial class TripsJ
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("version")]
    public int Version { get; set; }

    [Column("json_object", TypeName = "jsonb")]
    public string JsonObject { get; set; } = null!;

    [InverseProperty("Trip")]
    public virtual ICollection<TripTravelersJ> TripTravelersJs { get; set; } = new List<TripTravelersJ>();

    [ForeignKey("UserId")]
    [InverseProperty("TripsJs")]
    public virtual Traveler User { get; set; } = null!;
}
