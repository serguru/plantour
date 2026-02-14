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

    [Column("type")]
    public string Type { get; set; } = null!;

    [Column("received_at", TypeName = "timestamp without time zone")]
    public DateTime ReceivedAt { get; set; }

    [Column("processed_at", TypeName = "timestamp without time zone")]
    public DateTime? ProcessedAt { get; set; }

    [Column("processing_error")]
    public string? ProcessingError { get; set; }
}
