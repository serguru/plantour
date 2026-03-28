using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("user_keys", Schema = "plantour")]
[Index("UserId", "Name", Name = "idx_user_keys_user_id_name", IsUnique = true)]
public partial class UserKey
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("name")]
    public string Name { get; set; } = null!;

    [Column("key")]
    public string Key { get; set; } = null!;

    [Column("active")]
    public bool Active { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("UserKeys")]
    public virtual User User { get; set; } = null!;
}
