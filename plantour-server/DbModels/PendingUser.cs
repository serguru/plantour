using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("pending_users", Schema = "plantour")]
[Index("CheckoutSessionId", Name = "idx_pending_users_checkout_session_id")]
[Index("ExpiresAt", Name = "idx_pending_users_expires_at")]
[Index("PaymentIntentId", Name = "idx_pending_users_payment_intent_id")]
[Index("Status", Name = "idx_pending_users_status")]
[Index("CheckoutSessionId", Name = "pending_users_checkout_session_id_key", IsUnique = true)]
[Index("Email", Name = "pending_users_email_key", IsUnique = true)]
public partial class PendingUser
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("email")]
    public string Email { get; set; } = null!;

    [Column("first_name")]
    public string? FirstName { get; set; }

    [Column("last_name")]
    public string? LastName { get; set; }

    [Column("checkout_session_id")]
    public string CheckoutSessionId { get; set; } = null!;

    [Column("payment_intent_id")]
    public string PaymentIntentId { get; set; } = null!;

    [Column("subscription_id")]
    public string? SubscriptionId { get; set; }

    [Column("plan_id")]
    public string? PlanId { get; set; }

    [Column("customer_id")]
    public string? CustomerId { get; set; }

    [Column("metadata", TypeName = "jsonb")]
    public string? Metadata { get; set; }

    [Column("created_at", TypeName = "timestamp without time zone")]
    public DateTime? CreatedAt { get; set; }

    [Column("expires_at", TypeName = "timestamp without time zone")]
    public DateTime? ExpiresAt { get; set; }

    [Column("status")]
    public string? Status { get; set; }
}
