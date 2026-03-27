using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("trip_user_todos", Schema = "plantour")]
[Index("TripUserId", "Name", Name = "idx_trip_user_todos_trip_user_id_name", IsUnique = true)]
public partial class TripUserTodo
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("trip_user_id")]
    public Guid TripUserId { get; set; }

    [Column("category")]
    public string? Category { get; set; }

    [Column("name")]
    public string Name { get; set; } = null!;

    [Column("notes")]
    public string? Notes { get; set; }

    [Column("finished_at")]
    public DateTime? FinishedAt { get; set; }

    [Column("finished")]
    public string? Finished { get; set; }

    [InverseProperty("AssignedTodo")]
    public virtual ICollection<TripSharedTodo> TripSharedTodos { get; set; } = new List<TripSharedTodo>();

    [ForeignKey("TripUserId")]
    [InverseProperty("TripUserTodos")]
    public virtual TripUser TripUser { get; set; } = null!;
}
