using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Plantour.Models;

[Table("packages_j", Schema = "plantour")]
[Index("CategoryId", Name = "idx_packages_j_category_id")]
[Index("ParentPackageId", Name = "idx_packages_j_parent_package_id")]
public partial class PackagesJ
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("category_id")]
    public Guid CategoryId { get; set; }

    [Column("parent_package_id")]
    public Guid? ParentPackageId { get; set; }

    [Column("version")]
    public int Version { get; set; }

    [Column("json_object", TypeName = "jsonb")]
    public string JsonObject { get; set; } = null!;

    [ForeignKey("CategoryId")]
    [InverseProperty("PackagesJs")]
    public virtual PackageCategoriesJ Category { get; set; } = null!;

    [InverseProperty("ParentPackage")]
    public virtual ICollection<PackagesJ> InverseParentPackage { get; set; } = new List<PackagesJ>();

    [ForeignKey("ParentPackageId")]
    [InverseProperty("InverseParentPackage")]
    public virtual PackagesJ? ParentPackage { get; set; }

    [InverseProperty("Package")]
    public virtual ICollection<TripThingsJ> TripThingsJs { get; set; } = new List<TripThingsJ>();
}
