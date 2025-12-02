using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("package_categories", Schema = "plantour")]
[Index("Name", Name = "package_categories_name_key", IsUnique = true)]
public partial class PackageCategory
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("name")]
    [StringLength(50)]
    public string Name { get; set; } = null!;

    [Column("notes")]
    public string? Notes { get; set; }

    [InverseProperty("Category")]
    public virtual ICollection<UserPackage> UserPackages { get; set; } = new List<UserPackage>();
}
