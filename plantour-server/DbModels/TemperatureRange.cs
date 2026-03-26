using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("temperature_ranges", Schema = "plantour_v2")]
[Index("Name", Name = "temperature_ranges_name_key", IsUnique = true)]
public partial class TemperatureRange
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("name")]
    public string Name { get; set; } = null!;

    [Column("fromtemp")]
    public int? Fromtemp { get; set; }

    [Column("totemp")]
    public int? Totemp { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    [InverseProperty("TemperatureRanges")]
    public virtual ICollection<ThingTemplate> ThingTemplates { get; set; } = new List<ThingTemplate>();
}
