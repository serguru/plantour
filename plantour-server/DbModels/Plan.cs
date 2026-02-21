using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("plans", Schema = "plantour")]
[Index("Name", Name = "plans_name_key", IsUnique = true)]
public partial class Plan
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("name")]
    public string Name { get; set; } = null!;

    [Column("notes")]
    public string? Notes { get; set; }

    [Column("active")]
    public bool? Active { get; set; }

    [Column("public")]
    public bool? Public { get; set; }

    [Column("created_at", TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; }

    [InverseProperty("Plan")]
    public virtual ICollection<Price> Prices { get; set; } = new List<Price>();

    [InverseProperty("Plan")]
    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
