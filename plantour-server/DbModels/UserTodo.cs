using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("user_todos", Schema = "plantour")]
[Index("UserId", "Name", Name = "idx_user_todos_user_id_name", IsUnique = true)]
public partial class UserTodo
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("category")]
    public string? Category { get; set; }

    [Column("name")]
    public string Name { get; set; } = null!;

    [Column("notes")]
    public string? Notes { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("UserTodos")]
    public virtual User User { get; set; } = null!;
}
