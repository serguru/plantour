using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Plantour.Models;

[Table("package_categories_j", Schema = "plantour")]
public partial class PackageCategoriesJ
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
    public virtual ICollection<PackagesJ> PackagesJs { get; set; } = new List<PackagesJ>();

    [ForeignKey("TravelerId")]
    [InverseProperty("PackageCategoriesJs")]
    public virtual Traveler Traveler { get; set; } = null!;
}
