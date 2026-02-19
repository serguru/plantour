using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("stripe_webhook_events", Schema = "plantour")]
[Index("StripeEventId", Name = "stripe_webhook_events_stripe_event_id_key", IsUnique = true)]
public partial class StripeWebhookEvent
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("stripe_event_id")]
    public string StripeEventId { get; set; } = null!;

    [Column("stripe_event_type_id")]
    public Guid StripeEventTypeId { get; set; }

    [Column("object_id")]
    [StringLength(255)]
    public string? ObjectId { get; set; }

    [Column("data", TypeName = "jsonb")]
    public string Data { get; set; } = null!;

    [Column("processed")]
    public bool? Processed { get; set; }

    [Column("created_at", TypeName = "timestamp without time zone")]
    public DateTime? CreatedAt { get; set; }

    [ForeignKey("StripeEventTypeId")]
    [InverseProperty("StripeWebhookEvents")]
    public virtual StripeEventType StripeEventType { get; set; } = null!;
}
