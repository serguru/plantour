using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("participant_status", Schema = "plantour")]
[Index("Name", Name = "participant_status_name_key", IsUnique = true)]
public partial class ParticipantStatus
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("name")]
    [StringLength(50)]
    public string Name { get; set; } = null!;

    [Column("notes")]
    public string? Notes { get; set; }
}
