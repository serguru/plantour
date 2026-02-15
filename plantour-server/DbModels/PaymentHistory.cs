using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("payment_history", Schema = "plantour")]
public partial class PaymentHistory
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("stripe_invoice_id")]
    public string StripeInvoiceId { get; set; } = null!;

    [Column("amount_paid")]
    public int AmountPaid { get; set; }

    [Column("currency_id")]
    public Guid CurrencyId { get; set; }

    [Column("payment_status_id")]
    public Guid PaymentStatusId { get; set; }

    [Column("payment_date", TypeName = "timestamp without time zone")]
    public DateTime PaymentDate { get; set; }

    [Column("billing_reason_id")]
    public Guid BillingReasonId { get; set; }

    [Column("created_at", TypeName = "timestamp without time zone")]
    public DateTime? CreatedAt { get; set; }

    [ForeignKey("BillingReasonId")]
    [InverseProperty("PaymentHistories")]
    public virtual BillingReason BillingReason { get; set; } = null!;

    [ForeignKey("CurrencyId")]
    [InverseProperty("PaymentHistories")]
    public virtual Currency Currency { get; set; } = null!;

    [ForeignKey("PaymentStatusId")]
    [InverseProperty("PaymentHistories")]
    public virtual PaymentStatus PaymentStatus { get; set; } = null!;

    [ForeignKey("UserId")]
    [InverseProperty("PaymentHistories")]
    public virtual User User { get; set; } = null!;
}
