using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("user_packages", Schema = "plantour")]
[Index("CategoryId", Name = "idx_user_packages_category_id")]
[Index("UserId", "Name", Name = "idx_user_packages_user_id_short_description", IsUnique = true)]
public partial class UserPackage
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("category_id")]
    public Guid? CategoryId { get; set; }

    [Column("name")]
    [StringLength(200)]
    public string Name { get; set; } = null!;

    [Column("description")]
    public string? Description { get; set; }

    [ForeignKey("CategoryId")]
    [InverseProperty("UserPackages")]
    public virtual PackageCategory? Category { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("UserPackages")]
    public virtual User User { get; set; } = null!;
}
