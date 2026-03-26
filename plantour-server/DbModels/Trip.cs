using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("trips", Schema = "plantour_v2")]
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
    public string Name { get; set; } = null!;

    [Column("notes")]
    public string? Notes { get; set; }

    [Column("start_date")]
    public DateOnly StartDate { get; set; }

    [Column("end_date")]
    public DateOnly EndDate { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("currency_id")]
    public Guid CurrencyId { get; set; }

    [ForeignKey("CurrencyId")]
    [InverseProperty("Trips")]
    public virtual Currency Currency { get; set; } = null!;

    [InverseProperty("Trip")]
    public virtual ICollection<ItineraryPart> ItineraryParts { get; set; } = new List<ItineraryPart>();

    [InverseProperty("Trip")]
    public virtual ICollection<TripComment> TripComments { get; set; } = new List<TripComment>();

    [InverseProperty("Trip")]
    public virtual ICollection<TripSharedExpense> TripSharedExpenses { get; set; } = new List<TripSharedExpense>();

    [InverseProperty("Trip")]
    public virtual ICollection<TripSharedThing> TripSharedThings { get; set; } = new List<TripSharedThing>();

    [InverseProperty("Trip")]
    public virtual ICollection<TripSharedTodo> TripSharedTodos { get; set; } = new List<TripSharedTodo>();

    [ForeignKey("TripStatusId")]
    [InverseProperty("Trips")]
    public virtual TripStatus TripStatus { get; set; } = null!;

    [InverseProperty("Trip")]
    public virtual ICollection<TripUser> TripUsers { get; set; } = new List<TripUser>();

    [ForeignKey("UserId")]
    [InverseProperty("Trips")]
    public virtual User User { get; set; } = null!;
}
