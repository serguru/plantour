using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("age_ranges", Schema = "plantour_v2")]
[Index("Name", Name = "age_ranges_name_key", IsUnique = true)]
public partial class AgeRange
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("name")]
    public string Name { get; set; } = null!;

    [Column("fromage")]
    public int Fromage { get; set; }

    [Column("toage")]
    public int? Toage { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    [InverseProperty("AgeRanges")]
    public virtual ICollection<ThingTemplate> ThingTemplates { get; set; } = new List<ThingTemplate>();
}
