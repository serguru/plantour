using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("unit_categories", Schema = "plantour")]
[Index("Name", Name = "unit_categories_name_key", IsUnique = true)]
public partial class UnitCategory
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("name")]
    [StringLength(50)]
    public string Name { get; set; } = null!;

    [Column("notes")]
    public string? Notes { get; set; }

    [InverseProperty("UnitCategory")]
    public virtual ICollection<Unit> Units { get; set; } = new List<Unit>();
}
