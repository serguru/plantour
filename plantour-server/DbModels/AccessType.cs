using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("access_types", Schema = "plantour")]
[Index("Name", Name = "access_types_name_key", IsUnique = true)]
public partial class AccessType
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("name")]
    public string Name { get; set; } = null!;

    [Column("notes")]
    public string? Notes { get; set; }

    [InverseProperty("AccessType")]
    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
