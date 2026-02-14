using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("stripe_customers", Schema = "plantour")]
[Index("StripeCustomerId", Name = "stripe_customers_stripe_customer_id_key", IsUnique = true)]
[Index("UserId", Name = "stripe_customers_user_id_key", IsUnique = true)]
public partial class StripeCustomer
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("stripe_customer_id")]
    public string StripeCustomerId { get; set; } = null!;

    [Column("created_at", TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("StripeCustomer")]
    public virtual User User { get; set; } = null!;
}
