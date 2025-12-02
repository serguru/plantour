using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("currencies", Schema = "plantour")]
[Index("Name", Name = "currencies_name_key", IsUnique = true)]
public partial class Currency
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("name")]
    [StringLength(50)]
    public string Name { get; set; } = null!;

    [Column("character")]
    public string? Character { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }
}
