using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.Models;

[Table("user_package_categories", Schema = "plantour")]
[Index("UserId", "Name", Name = "idx_user_package_categories_user_id_name", IsUnique = true)]
public partial class UserPackageCategory
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("name")]
    [StringLength(50)]
    public string Name { get; set; } = null!;

    [Column("notes")]
    public string? Notes { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("UserPackageCategories")]
    public virtual User User { get; set; } = null!;

    [InverseProperty("Category")]
    public virtual ICollection<UserPackage> UserPackages { get; set; } = new List<UserPackage>();
}
