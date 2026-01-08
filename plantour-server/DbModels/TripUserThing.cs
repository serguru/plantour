using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("trip_user_things", Schema = "plantour")]
[Index("TripUserId", "Name", Name = "idx_trip_user_things_trip_user_id_name", IsUnique = true)]
public partial class TripUserThing
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("trip_user_id")]
    public Guid TripUserId { get; set; }

    [Column("category")]
    [StringLength(50)]
    public string? Category { get; set; }

    [Column("name")]
    [StringLength(200)]
    public string Name { get; set; } = null!;

    [Column("units")]
    [StringLength(50)]
    public string? Units { get; set; }

    [Column("value")]
    [Precision(10, 3)]
    public decimal? Value { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    [Column("trip_user_package_id")]
    public Guid? TripUserPackageId { get; set; }

    [Column("finished_at")]
    public DateTime? FinishedAt { get; set; }

    [Column("finished")]
    public string? Finished { get; set; }

    [InverseProperty("AssignedThing")]
    public virtual ICollection<TripSharedThing> TripSharedThings { get; set; } = new List<TripSharedThing>();

    [ForeignKey("TripUserId")]
    [InverseProperty("TripUserThings")]
    public virtual TripUser TripUser { get; set; } = null!;

    [ForeignKey("TripUserPackageId")]
    [InverseProperty("TripUserThings")]
    public virtual TripUserPackage? TripUserPackage { get; set; }
}
