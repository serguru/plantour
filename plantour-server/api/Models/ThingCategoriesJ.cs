using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Plantour.Models;

[Table("thing_categories_j", Schema = "plantour")]
[Index("TravelerId", Name = "idx_package_categories_j_traveler_id")]
[Index("TravelerId", Name = "thing_categories_j_traveler_id")]
public partial class ThingCategoriesJ
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("traveler_id")]
    public Guid TravelerId { get; set; }

    [Column("version")]
    public int Version { get; set; }

    [Column("json_object", TypeName = "jsonb")]
    public string JsonObject { get; set; } = null!;

    [InverseProperty("Category")]
    public virtual ICollection<ThingsJ> ThingsJs { get; set; } = new List<ThingsJ>();

    [ForeignKey("TravelerId")]
    [InverseProperty("ThingCategoriesJs")]
    public virtual Traveler Traveler { get; set; } = null!;
}
