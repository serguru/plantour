using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("template_things", Schema = "plantour")]
[Index("Name", Name = "template_things_name_key", IsUnique = true)]
public partial class TemplateThing
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("template_id")]
    public Guid TemplateId { get; set; }

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

    [Column("notes")]
    public string? Notes { get; set; }

    [ForeignKey("TemplateId")]
    [InverseProperty("TemplateThings")]
    public virtual ThingTemplate Template { get; set; } = null!;
}
