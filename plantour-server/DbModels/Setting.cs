using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("settings", Schema = "plantour")]
public partial class Setting
{
    [Key]
    [Column("key")]
    public string Key { get; set; } = null!;

    [Column("value")]
    public string Value { get; set; } = null!;

    [Column("value_type")]
    public string ValueType { get; set; } = null!;

    [Column("notes")]
    public string? Notes { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; }
}
