using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("trip_user_packages", Schema = "plantour_v2")]
[Index("TripUserId", "Name", Name = "idx_trip_user_packages_trip_user_id_name", IsUnique = true)]
public partial class TripUserPackage
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("trip_user_id")]
    public Guid TripUserId { get; set; }

    [Column("name")]
    public string Name { get; set; } = null!;

    [Column("label")]
    public string? Label { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    [Column("packing_list_included")]
    public bool PackingListIncluded { get; set; }

    [Column("weight_value")]
    [Precision(10, 3)]
    public decimal? WeightValue { get; set; }

    [Column("weight_unit")]
    public string? WeightUnit { get; set; }

    [ForeignKey("TripUserId")]
    [InverseProperty("TripUserPackages")]
    public virtual TripUser TripUser { get; set; } = null!;

    [InverseProperty("TripUserPackage")]
    public virtual ICollection<TripUserThing> TripUserThings { get; set; } = new List<TripUserThing>();
}
