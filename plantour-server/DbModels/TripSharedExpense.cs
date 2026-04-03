using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("trip_shared_expenses", Schema = "plantour")]
public partial class TripSharedExpense
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("trip_id")]
    public Guid TripId { get; set; }

    [Column("category")]
    public string? Category { get; set; }

    [Column("name")]
    public string Name { get; set; } = null!;

    [Column("amount")]
    [Precision(19, 2)]
    public decimal Amount { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    [ForeignKey("TripId")]
    [InverseProperty("TripSharedExpenses")]
    public virtual Trip Trip { get; set; } = null!;
}
