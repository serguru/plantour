using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("units", Schema = "plantour")]
[Index("Abbreviation", Name = "units_abbreviation_key", IsUnique = true)]
[Index("Name", Name = "units_name_key", IsUnique = true)]
public partial class Unit
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("unit_category_id")]
    public Guid UnitCategoryId { get; set; }

    [Column("name")]
    [StringLength(50)]
    public string Name { get; set; } = null!;

    [Column("abbreviation")]
    [StringLength(10)]
    public string Abbreviation { get; set; } = null!;

    [InverseProperty("WeightUnit")]
    public virtual ICollection<TripUserPackage> TripUserPackages { get; set; } = new List<TripUserPackage>();

    [ForeignKey("UnitCategoryId")]
    [InverseProperty("Units")]
    public virtual UnitCategory UnitCategory { get; set; } = null!;
}
