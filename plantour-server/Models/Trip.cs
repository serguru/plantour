using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.Models;

[Table("trips", Schema = "plantour")]
[Index("OwnerId", Name = "idx_trips_owner_id")]
public partial class Trip
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("owner_id")]
    public Guid OwnerId { get; set; }

    [Column("trip_status_id")]
    public Guid? TripStatusId { get; set; }

    [Column("short_description")]
    [StringLength(200)]
    public string ShortDescription { get; set; } = null!;

    [Column("description")]
    public string? Description { get; set; }

    [Column("start_date")]
    public DateOnly? StartDate { get; set; }

    [Column("end_date")]
    public DateOnly? EndDate { get; set; }

    [Column("require_weight")]
    public bool? RequireWeight { get; set; }

    [InverseProperty("Trip")]
    public virtual ICollection<Invitation> Invitations { get; set; } = new List<Invitation>();

    [ForeignKey("OwnerId")]
    [InverseProperty("Trips")]
    public virtual User Owner { get; set; } = null!;

    [ForeignKey("TripStatusId")]
    [InverseProperty("Trips")]
    public virtual TripStatus? TripStatus { get; set; }

    [InverseProperty("Trip")]
    public virtual ICollection<TripUser> TripUsers { get; set; } = new List<TripUser>();
}
