using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("superusers", Schema = "plantour")]
[Index("Email", Name = "superusers_email_key", IsUnique = true)]
[Index("Name", Name = "superusers_name_key", IsUnique = true)]
public partial class Superuser
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("email")]
    public string Email { get; set; } = null!;

    [Column("name")]
    public string Name { get; set; } = null!;

    [Column("phone")]
    public string? Phone { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    [Column("hashed_password")]
    public string HashedPassword { get; set; } = null!;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }
}
