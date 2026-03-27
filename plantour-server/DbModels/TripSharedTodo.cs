using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("trip_shared_todos", Schema = "plantour")]
[Index("TripId", "Name", Name = "idx_trip_shared_todos_trip_id_name", IsUnique = true)]
public partial class TripSharedTodo
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("trip_id")]
    public Guid TripId { get; set; }

    [Column("category")]
    public string? Category { get; set; }

    [Column("name")]
    public string Name { get; set; } = null!;

    [Column("notes")]
    public string? Notes { get; set; }

    [Column("assigned_to_id")]
    public Guid? AssignedToId { get; set; }

    [Column("assigned_todo_id")]
    public Guid? AssignedTodoId { get; set; }

    [Column("assigned_at")]
    public DateTime? AssignedAt { get; set; }

    [Column("assigned_deadline")]
    public DateTime? AssignedDeadline { get; set; }

    [Column("rejected")]
    public bool Rejected { get; set; }

    [ForeignKey("AssignedToId")]
    [InverseProperty("TripSharedTodos")]
    public virtual TripUser? AssignedTo { get; set; }

    [ForeignKey("AssignedTodoId")]
    [InverseProperty("TripSharedTodos")]
    public virtual TripUserTodo? AssignedTodo { get; set; }

    [ForeignKey("TripId")]
    [InverseProperty("TripSharedTodos")]
    public virtual Trip Trip { get; set; } = null!;
}
