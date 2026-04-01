using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("trip_user_improvements", Schema = "plantour")]
[Index("TripUserId", "ImprovementOrder", Name = "idx_trip_user_improvements_improvement_order", IsUnique = true)]
public partial class TripUserImprovement
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("trip_user_id")]
    public Guid TripUserId { get; set; }

    [Column("name")]
    public string Name { get; set; } = null!;

    [Column("notes")]
    public string? Notes { get; set; }

    [Column("improvement_order")]
    public int ImprovementOrder { get; set; }

    [Column("finished")]
    public string? Finished { get; set; }

    [ForeignKey("TripUserId")]
    [InverseProperty("TripUserImprovements")]
    public virtual TripUser TripUser { get; set; } = null!;
}
