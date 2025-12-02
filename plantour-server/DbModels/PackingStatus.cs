using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("packing_status", Schema = "plantour")]
[Index("Name", Name = "packing_status_name_key", IsUnique = true)]
public partial class PackingStatus
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("name")]
    [StringLength(100)]
    public string Name { get; set; } = null!;

    [Column("notes")]
    public string? Notes { get; set; }

    [InverseProperty("PackingStatus")]
    public virtual ICollection<TripUserPackage> TripUserPackages { get; set; } = new List<TripUserPackage>();

    [InverseProperty("PackingStatus")]
    public virtual ICollection<TripUserThing> TripUserThings { get; set; } = new List<TripUserThing>();
}
