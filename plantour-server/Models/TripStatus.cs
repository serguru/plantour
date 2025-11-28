using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.Models;

[Table("trip_status", Schema = "plantour")]
[Index("Name", Name = "trip_status_name_key", IsUnique = true)]
public partial class TripStatus
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("name")]
    [StringLength(100)]
    public string Name { get; set; } = null!;

    [Column("notes")]
    public string? Notes { get; set; }

    [InverseProperty("TripStatus")]
    public virtual ICollection<Trip> Trips { get; set; } = new List<Trip>();
}
