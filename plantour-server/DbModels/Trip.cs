using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("trips", Schema = "plantour")]
[Index("UserId", "Name", Name = "idx_trips_user_id_name", IsUnique = true)]
public partial class Trip
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("trip_status_id")]
    public Guid TripStatusId { get; set; }

    [Column("name")]
    [StringLength(200)]
    public string Name { get; set; } = null!;

    [Column("notes")]
    public string? Notes { get; set; }

    [Column("start_date")]
    public DateOnly? StartDate { get; set; }

    [Column("end_date")]
    public DateOnly? EndDate { get; set; }

    [InverseProperty("Trip")]
    public virtual ICollection<Invitation> Invitations { get; set; } = new List<Invitation>();

    [InverseProperty("Trip")]
    public virtual ICollection<TripSharedThing> TripSharedThings { get; set; } = new List<TripSharedThing>();

    [ForeignKey("TripStatusId")]
    [InverseProperty("Trips")]
    public virtual TripStatus TripStatus { get; set; } = null!;

    [InverseProperty("Trip")]
    public virtual ICollection<TripUser> TripUsers { get; set; } = new List<TripUser>();

    [ForeignKey("UserId")]
    [InverseProperty("Trips")]
    public virtual User User { get; set; } = null!;
}
