using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("prices", Schema = "plantour")]
[Index("Name", Name = "prices_name_key", IsUnique = true)]
[Index("PaddlePriceId", Name = "prices_paddle_price_id_key", IsUnique = true)]
public partial class Price
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("plan_id")]
    public Guid PlanId { get; set; }

    [Column("paddle_price_id")]
    public string? PaddlePriceId { get; set; }

    [Column("name")]
    public string Name { get; set; } = null!;

    [Column("value_cents")]
    public int ValueCents { get; set; }

    [ForeignKey("PlanId")]
    [InverseProperty("Prices")]
    public virtual Plan Plan { get; set; } = null!;
}
