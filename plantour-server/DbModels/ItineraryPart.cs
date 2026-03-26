using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("itinerary_parts", Schema = "plantour_v2")]
[Index("TripId", "Name", "StartDate", Name = "idx_itinerary_parts_trip_id_name", IsUnique = true)]
public partial class ItineraryPart
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("trip_id")]
    public Guid TripId { get; set; }

    [Column("name")]
    public string Name { get; set; } = null!;

    [Column("category")]
    public string? Category { get; set; }

    [Column("location")]
    public string? Location { get; set; }

    [Column("latitude")]
    [Precision(9, 6)]
    public decimal? Latitude { get; set; }

    [Column("longitude")]
    [Precision(9, 6)]
    public decimal? Longitude { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    [Column("start_date")]
    public DateTime StartDate { get; set; }

    [Column("end_date")]
    public DateTime? EndDate { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [ForeignKey("TripId")]
    [InverseProperty("ItineraryParts")]
    public virtual Trip Trip { get; set; } = null!;
}
