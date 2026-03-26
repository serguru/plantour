using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("CronTickerOccurrences", Schema = "plantour_v2")]
[Index("CronTickerId", Name = "IX_CronTickerOccurrence_CronTickerId")]
[Index("ExecutionTime", Name = "IX_CronTickerOccurrence_ExecutionTime")]
[Index("Status", "ExecutionTime", Name = "IX_CronTickerOccurrence_Status_ExecutionTime")]
[Index("CronTickerId", "ExecutionTime", Name = "UQ_CronTickerId_ExecutionTime", IsUnique = true)]
public partial class CronTickerOccurrence
{
    [Key]
    public Guid Id { get; set; }

    public int Status { get; set; }

    public string? LockHolder { get; set; }

    [Column(TypeName = "timestamp without time zone")]
    public DateTime ExecutionTime { get; set; }

    public Guid CronTickerId { get; set; }

    [Column(TypeName = "timestamp without time zone")]
    public DateTime? LockedAt { get; set; }

    [Column(TypeName = "timestamp without time zone")]
    public DateTime? ExecutedAt { get; set; }

    public string? ExceptionMessage { get; set; }

    public string? SkippedReason { get; set; }

    public long ElapsedTime { get; set; }

    public int RetryCount { get; set; }

    [Column(TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; }

    [Column(TypeName = "timestamp without time zone")]
    public DateTime UpdatedAt { get; set; }

    [ForeignKey("CronTickerId")]
    [InverseProperty("CronTickerOccurrences")]
    public virtual CronTicker CronTicker { get; set; } = null!;
}
