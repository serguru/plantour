using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Plantour.Models;

[Table("traveler_package_categories", Schema = "plantour")]
[Index("TravelerId", "Name", Name = "idx_traveler_package_categories_traveler_id_name", IsUnique = true)]
public partial class TravelerPackageCategory
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("traveler_id")]
    public Guid TravelerId { get; set; }

    [Column("name")]
    [StringLength(50)]
    public string Name { get; set; } = null!;

    [Column("notes")]
    public string? Notes { get; set; }

    [ForeignKey("TravelerId")]
    [InverseProperty("TravelerPackageCategories")]
    public virtual Traveler Traveler { get; set; } = null!;

    [InverseProperty("Category")]
    public virtual ICollection<TravelerPackage> TravelerPackages { get; set; } = new List<TravelerPackage>();
}
