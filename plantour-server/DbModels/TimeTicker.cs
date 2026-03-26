using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("TimeTickers", Schema = "plantour_v2")]
[Index("ExecutionTime", Name = "IX_TimeTicker_ExecutionTime")]
[Index("Status", "ExecutionTime", Name = "IX_TimeTicker_Status_ExecutionTime")]
[Index("ParentId", Name = "IX_TimeTickers_ParentId")]
public partial class TimeTicker
{
    [Key]
    public Guid Id { get; set; }

    public string? Function { get; set; }

    public string? Description { get; set; }

    public string? InitIdentifier { get; set; }

    [Column(TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; }

    [Column(TypeName = "timestamp without time zone")]
    public DateTime UpdatedAt { get; set; }

    public int Status { get; set; }

    public string? LockHolder { get; set; }

    public byte[]? Request { get; set; }

    [Column(TypeName = "timestamp without time zone")]
    public DateTime? ExecutionTime { get; set; }

    [Column(TypeName = "timestamp without time zone")]
    public DateTime? LockedAt { get; set; }

    [Column(TypeName = "timestamp without time zone")]
    public DateTime? ExecutedAt { get; set; }

    public string? ExceptionMessage { get; set; }

    public string? SkippedReason { get; set; }

    public long ElapsedTime { get; set; }

    public int Retries { get; set; }

    public int RetryCount { get; set; }

    public List<int>? RetryIntervals { get; set; }

    public Guid? ParentId { get; set; }

    public int? RunCondition { get; set; }

    [InverseProperty("Parent")]
    public virtual ICollection<TimeTicker> InverseParent { get; set; } = new List<TimeTicker>();

    [ForeignKey("ParentId")]
    [InverseProperty("InverseParent")]
    public virtual TimeTicker? Parent { get; set; }
}
