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

    [InverseProperty("Plan")]
    public virtual ICollection<PlansHistory> PlansHistories { get; set; } = new List<PlansHistory>();
}
