using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Plantour.Models;

[Table("things_j", Schema = "plantour")]
[Index("CategoryId", Name = "idx_things_j_category_id")]
public partial class ThingsJ
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("category_id")]
    public Guid CategoryId { get; set; }

    [Column("version")]
    public int Version { get; set; }

    [Column("json_object", TypeName = "jsonb")]
    public string JsonObject { get; set; } = null!;

    [ForeignKey("CategoryId")]
    [InverseProperty("ThingsJs")]
    public virtual ThingCategoriesJ Category { get; set; } = null!;

    [InverseProperty("Thing")]
    public virtual ICollection<TripThingsJ> TripThingsJs { get; set; } = new List<TripThingsJ>();
}
