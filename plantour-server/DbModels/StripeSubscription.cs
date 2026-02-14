using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("stripe_subscriptions", Schema = "plantour")]
[Index("StripeSubscriptionId", Name = "stripe_subscriptions_stripe_subscription_id_key", IsUnique = true)]
public partial class StripeSubscription
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("stripe_subscription_id")]
    public string StripeSubscriptionId { get; set; } = null!;

    [Column("stripe_price_id")]
    public string StripePriceId { get; set; } = null!;

    [Column("status")]
    public string Status { get; set; } = null!;

    [Column("current_period_start", TypeName = "timestamp without time zone")]
    public DateTime? CurrentPeriodStart { get; set; }

    [Column("current_period_end", TypeName = "timestamp without time zone")]
    public DateTime? CurrentPeriodEnd { get; set; }

    [Column("cancel_at_period_end")]
    public bool CancelAtPeriodEnd { get; set; }

    [Column("canceled_at", TypeName = "timestamp without time zone")]
    public DateTime? CanceledAt { get; set; }

    [Column("created_at", TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at", TypeName = "timestamp without time zone")]
    public DateTime UpdatedAt { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("StripeSubscriptions")]
    public virtual User User { get; set; } = null!;
}
