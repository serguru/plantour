using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("access_statuses", Schema = "plantour")]
[Index("Name", Name = "access_statuses_name_key", IsUnique = true)]
public partial class AccessStatus
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("name")]
    public string Name { get; set; } = null!;

    [Column("notes")]
    public string? Notes { get; set; }

    [InverseProperty("AccessStatus")]
    public virtual ICollection<StatusesHistory> StatusesHistories { get; set; } = new List<StatusesHistory>();
}
