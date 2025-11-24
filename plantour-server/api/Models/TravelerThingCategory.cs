using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Plantour.Models;

[Table("traveler_thing_categories", Schema = "plantour")]
[Index("TravelerId", "Name", Name = "idx_traveler_thing_categories_traveler_id_name", IsUnique = true)]
public partial class TravelerThingCategory
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("traveler_id")]
    public Guid TravelerId { get; set; }

    [Column("name")]
    [StringLength(100)]
    public string Name { get; set; } = null!;

    [ForeignKey("TravelerId")]
    [InverseProperty("TravelerThingCategories")]
    public virtual Traveler Traveler { get; set; } = null!;

    [InverseProperty("Category")]
    public virtual ICollection<TravelerThing> TravelerThings { get; set; } = new List<TravelerThing>();
}
