using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("stripe_event_types", Schema = "plantour")]
[Index("Name", Name = "stripe_event_types_name_key", IsUnique = true)]
public partial class StripeEventType
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("name")]
    public string Name { get; set; } = null!;

    [Column("notes")]
    public string? Notes { get; set; }

    [InverseProperty("StripeEventType")]
    public virtual ICollection<StripeWebhookEvent> StripeWebhookEvents { get; set; } = new List<StripeWebhookEvent>();
}
