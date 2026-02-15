using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("plans", Schema = "plantour")]
[Index("Name", Name = "plans_name_key", IsUnique = true)]
public partial class Plan
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("name")]
    public string Name { get; set; } = null!;

    [Column("description")]
    public string? Description { get; set; }

    [Column("stripe_product_id")]
    public string? StripeProductId { get; set; }

    [Column("stripe_price_id_monthly")]
    public string? StripePriceIdMonthly { get; set; }

    [Column("stripe_price_id_yearly")]
    public string? StripePriceIdYearly { get; set; }

    [Column("features", TypeName = "jsonb")]
    public string? Features { get; set; }

    [Column("active")]
    public bool? Active { get; set; }

    [Column("created_at", TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at", TypeName = "timestamp without time zone")]
    public DateTime? UpdatedAt { get; set; }

    [InverseProperty("Plan")]
    public virtual ICollection<CustomerSubscription> CustomerSubscriptions { get; set; } = new List<CustomerSubscription>();

    [InverseProperty("Plan")]
    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
