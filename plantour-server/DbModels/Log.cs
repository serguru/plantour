using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("logs", Schema = "plantour")]
[Index("CreatedAt", Name = "ix_logs_created_at", AllDescending = true)]
public partial class Log
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("severity")]
    public string Severity { get; set; } = null!;

    [Column("category")]
    public string Category { get; set; } = null!;

    [Column("message")]
    public string Message { get; set; } = null!;

    [Column("user_id")]
    public Guid? UserId { get; set; }

    [Column("properties", TypeName = "jsonb")]
    public string Properties { get; set; } = null!;
}
