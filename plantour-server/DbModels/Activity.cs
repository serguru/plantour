using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("activities", Schema = "plantour")]
[Index("Name", Name = "activities_name_key", IsUnique = true)]
public partial class Activity
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("name")]
    public string Name { get; set; } = null!;

    [Column("notes")]
    public string Notes { get; set; } = null!;

    [InverseProperty("Activity")]
    public virtual ICollection<ThingTemplate> ThingTemplates { get; set; } = new List<ThingTemplate>();
}
