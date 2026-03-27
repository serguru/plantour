using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("trip_activities", Schema = "plantour")]
public partial class TripActivity
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("trip_id")]
    public Guid TripId { get; set; }

    [Column("trip_user_id")]
    public Guid? TripUserId { get; set; }

    [Column("itinerary_part_id")]
    public Guid? ItineraryPartId { get; set; }

    [Column("activity")]
    public string? Activity { get; set; }

    [Column("name")]
    public string Name { get; set; } = null!;

    [Column("notes")]
    public string? Notes { get; set; }

    [Column("start_date")]
    public DateTime? StartDate { get; set; }

    [Column("end_date")]
    public DateTime? EndDate { get; set; }

    [Column("address")]
    public string? Address { get; set; }

    [Column("latitude")]
    [Precision(9, 6)]
    public decimal? Latitude { get; set; }

    [Column("longitude")]
    [Precision(9, 6)]
    public decimal? Longitude { get; set; }

    [ForeignKey("ItineraryPartId")]
    [InverseProperty("TripActivities")]
    public virtual ItineraryPart? ItineraryPart { get; set; }

    [ForeignKey("TripId")]
    [InverseProperty("TripActivities")]
    public virtual Trip Trip { get; set; } = null!;

    [ForeignKey("TripUserId")]
    [InverseProperty("TripActivities")]
    public virtual TripUser? TripUser { get; set; }
}
