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

    [Column("payment_method")]
    public string? PaymentMethod { get; set; }

    [Column("currency_id")]
    public Guid? CurrencyId { get; set; }

    [Column("amount")]
    [Precision(19, 2)]
    public decimal Amount { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    [Column("assigned_to_id")]
    public Guid? AssignedToId { get; set; }

    [Column("assigned_expense_id")]
    public Guid? AssignedExpenseId { get; set; }

    [Column("assigned_at")]
    public DateTime? AssignedAt { get; set; }

    [Column("assigned_deadline")]
    public DateTime? AssignedDeadline { get; set; }

    [Column("rejected")]
    public bool Rejected { get; set; }

    [ForeignKey("AssignedExpenseId")]
    [InverseProperty("TripSharedExpenses")]
    public virtual TripUserExpense? AssignedExpense { get; set; }

    [ForeignKey("AssignedToId")]
    [InverseProperty("TripSharedExpenses")]
    public virtual TripUser? AssignedTo { get; set; }

    [ForeignKey("CurrencyId")]
    [InverseProperty("TripSharedExpenses")]
    public virtual Currency? Currency { get; set; }

    [ForeignKey("TripId")]
    [InverseProperty("TripSharedExpenses")]
    public virtual Trip Trip { get; set; } = null!;
}
