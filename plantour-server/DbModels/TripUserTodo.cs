using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("trip_user_todos", Schema = "plantour_v2")]
[Index("TripUserId", "Name", Name = "idx_trip_user_todos_trip_user_id_name", IsUnique = true)]
public partial class TripUserTodo
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("trip_user_id")]
    public Guid TripUserId { get; set; }

    [Column("itinerary_part_id")]
    public Guid? ItineraryPartId { get; set; }

    [Column("category")]
    public string? Category { get; set; }

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

    [Column("finished_at")]
    public DateTime? FinishedAt { get; set; }

    [Column("finished")]
    public string? Finished { get; set; }

    [ForeignKey("ItineraryPartId")]
    [InverseProperty("TripUserTodos")]
    public virtual ItineraryPart? ItineraryPart { get; set; }

    [InverseProperty("AssignedTodo")]
    public virtual ICollection<TripSharedTodo> TripSharedTodos { get; set; } = new List<TripSharedTodo>();

    [ForeignKey("TripUserId")]
    [InverseProperty("TripUserTodos")]
    public virtual TripUser TripUser { get; set; } = null!;
}
