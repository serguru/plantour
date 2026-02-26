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

    [Column("allowed_items")]
    public int? AllowedItems { get; set; }

    [Column("allowed_travelers")]
    public int? AllowedTravelers { get; set; }

    [Column("allowed_ai_prompts")]
    public int? AllowedAiPrompts { get; set; }

    [Column("extended_ai_allowed")]
    public bool ExtendedAiAllowed { get; set; }

    [Column("created_at", TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; }

    [InverseProperty("Plan")]
    public virtual ICollection<Price> Prices { get; set; } = new List<Price>();
}
