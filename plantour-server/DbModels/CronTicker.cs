using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("CronTickers", Schema = "plantour")]
[Index("Expression", Name = "IX_CronTickers_Expression")]
[Index("Function", "Expression", Name = "IX_Function_Expression")]
public partial class CronTicker
{
    [Key]
    public Guid Id { get; set; }

    public string? Expression { get; set; }

    public byte[]? Request { get; set; }

    public int Retries { get; set; }

    public List<int>? RetryIntervals { get; set; }

    public string? Function { get; set; }

    public string? Description { get; set; }

    public string? InitIdentifier { get; set; }

    [Column(TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; }

    [Column(TypeName = "timestamp without time zone")]
    public DateTime UpdatedAt { get; set; }

    [InverseProperty("CronTicker")]
    public virtual ICollection<CronTickerOccurrence> CronTickerOccurrences { get; set; } = new List<CronTickerOccurrence>();
}
