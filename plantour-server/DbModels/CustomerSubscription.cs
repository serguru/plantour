using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("customer_subscriptions", Schema = "plantour")]
public partial class CustomerSubscription
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("stripe_subscription_id")]
    public string StripeSubscriptionId { get; set; } = null!;

    [Column("subscription_status")]
    public string SubscriptionStatus { get; set; } = null!;

    [Column("plan_id")]
    public Guid PlanId { get; set; }

    [Column("current_period_start", TypeName = "timestamp without time zone")]
    public DateTime CurrentPeriodStart { get; set; }

    [Column("current_period_end", TypeName = "timestamp without time zone")]
    public DateTime CurrentPeriodEnd { get; set; }

    [Column("cancel_at_period_end")]
    public bool? CancelAtPeriodEnd { get; set; }

    [Column("created_at", TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at", TypeName = "timestamp without time zone")]
    public DateTime UpdatedAt { get; set; }

    [ForeignKey("PlanId")]
    [InverseProperty("CustomerSubscriptions")]
    public virtual Plan Plan { get; set; } = null!;

    [ForeignKey("UserId")]
    [InverseProperty("CustomerSubscriptions")]
    public virtual User User { get; set; } = null!;
}
