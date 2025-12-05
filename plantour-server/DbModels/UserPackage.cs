using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("user_packages", Schema = "plantour")]
[Index("UserId", "Name", Name = "idx_user_packages_user_id_name", IsUnique = true)]
public partial class UserPackage
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("name")]
    [StringLength(200)]
    public string Name { get; set; } = null!;

    [Column("description")]
    public string? Description { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("UserPackages")]
    public virtual User User { get; set; } = null!;
}
