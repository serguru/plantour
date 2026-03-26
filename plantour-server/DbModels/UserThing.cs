using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("user_things", Schema = "plantour_v2")]
[Index("UserId", "Name", Name = "idx_user_things_user_id_name", IsUnique = true)]
public partial class UserThing
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

    [Column("units")]
    public string? Units { get; set; }

    [Column("value")]
    [Precision(10, 3)]
    public decimal? Value { get; set; }

    [Column("shared")]
    public bool Shared { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("UserThings")]
    public virtual User User { get; set; } = null!;
}
