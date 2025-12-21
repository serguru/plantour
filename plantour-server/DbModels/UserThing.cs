using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("user_things", Schema = "plantour")]
[Index("UserId", "Name", Name = "idx_user_things_user_id_name", IsUnique = true)]
public partial class UserThing
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("category")]
    [StringLength(50)]
    public string? Category { get; set; }

    [Column("name")]
    [StringLength(200)]
    public string Name { get; set; } = null!;

    [Column("units")]
    [StringLength(50)]
    public string? Units { get; set; }

    [Column("value")]
    [Precision(10, 3)]
    public decimal? Value { get; set; }

    [Column("common")]
    public bool Common { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("UserThings")]
    public virtual User User { get; set; } = null!;
}
