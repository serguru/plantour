using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("trip_user_expenses", Schema = "plantour_v2")]
public partial class TripUserExpense
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("trip_user_id")]
    public Guid TripUserId { get; set; }

    [Column("name")]
    public string Name { get; set; } = null!;

    [Column("payment_method")]
    public string? PaymentMethod { get; set; }

    [Column("currency_id")]
    public Guid? CurrencyId { get; set; }

    [Column("rate")]
    [Precision(19, 8)]
    public decimal? Rate { get; set; }

    [Column("amount")]
    [Precision(19, 2)]
    public decimal Amount { get; set; }

    [Column("recipient_id")]
    public Guid? RecipientId { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    [Column("finished_at")]
    public DateTime? FinishedAt { get; set; }

    [Column("finished")]
    public string? Finished { get; set; }

    [ForeignKey("CurrencyId")]
    [InverseProperty("TripUserExpenses")]
    public virtual Currency? Currency { get; set; }

    [ForeignKey("RecipientId")]
    [InverseProperty("TripUserExpenseRecipients")]
    public virtual TripUser? Recipient { get; set; }

    [InverseProperty("AssignedExpense")]
    public virtual ICollection<TripSharedExpense> TripSharedExpenses { get; set; } = new List<TripSharedExpense>();

    [ForeignKey("TripUserId")]
    [InverseProperty("TripUserExpenseTripUsers")]
    public virtual TripUser TripUser { get; set; } = null!;
}
