using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Plantour.Models;

[Table("communication_types", Schema = "plantour")]
[Index("Name", Name = "communication_types_name_key", IsUnique = true)]
public partial class CommunicationType
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("name")]
    [StringLength(100)]
    public string Name { get; set; } = null!;

    [Column("notes")]
    public string? Notes { get; set; }

    [InverseProperty("CommunicationType")]
    public virtual ICollection<Invitation> Invitations { get; set; } = new List<Invitation>();
}
