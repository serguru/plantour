using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("thing_templates", Schema = "plantour")]
[Index("Name", Name = "thing_templates_name_key", IsUnique = true)]
public partial class ThingTemplate
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("name")]
    public string Name { get; set; } = null!;

    [Column("activity_id")]
    public Guid ActivityId { get; set; }

    [Column("temperature_ranges_id")]
    public Guid? TemperatureRangesId { get; set; }

    [Column("age_ranges_id")]
    public Guid? AgeRangesId { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    [ForeignKey("ActivityId")]
    [InverseProperty("ThingTemplates")]
    public virtual Activity Activity { get; set; } = null!;

    [ForeignKey("AgeRangesId")]
    [InverseProperty("ThingTemplates")]
    public virtual AgeRange? AgeRanges { get; set; }

    [ForeignKey("TemperatureRangesId")]
    [InverseProperty("ThingTemplates")]
    public virtual TemperatureRange? TemperatureRanges { get; set; }

    [InverseProperty("Template")]
    public virtual ICollection<TemplateThing> TemplateThings { get; set; } = new List<TemplateThing>();
}
