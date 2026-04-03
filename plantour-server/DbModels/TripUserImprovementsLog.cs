using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("trip_user_improvements_log", Schema = "plantour")]
[Index("CreatedAt", Name = "idx_trip_user_improvements_log_created_at")]
public partial class TripUserImprovementsLog
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("trip_user_improvement_id")]
    public Guid TripUserImprovementId { get; set; }

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [ForeignKey("TripUserImprovementId")]
    [InverseProperty("TripUserImprovementsLogs")]
    public virtual TripUserImprovement TripUserImprovement { get; set; } = null!;
}
