using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.Models;

[Table("user_things", Schema = "plantour")]
[Index("CategoryId", Name = "idx_user_things_category_id")]
public partial class UserThing
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("category_id")]
    public Guid CategoryId { get; set; }

    [Column("short_description")]
    [StringLength(200)]
    public string ShortDescription { get; set; } = null!;

    [Column("description")]
    public string? Description { get; set; }

    [Column("brand")]
    [StringLength(100)]
    public string? Brand { get; set; }

    [Column("model")]
    [StringLength(100)]
    public string? Model { get; set; }

    [Column("color")]
    [StringLength(50)]
    public string? Color { get; set; }

    [Column("weight_value")]
    [Precision(10, 3)]
    public decimal? WeightValue { get; set; }

    [Column("weight_unit_id")]
    public Guid? WeightUnitId { get; set; }

    [Column("length_value")]
    [Precision(10, 2)]
    public decimal? LengthValue { get; set; }

    [Column("width_value")]
    [Precision(10, 2)]
    public decimal? WidthValue { get; set; }

    [Column("height_value")]
    [Precision(10, 2)]
    public decimal? HeightValue { get; set; }

    [Column("dimension_unit_id")]
    public Guid? DimensionUnitId { get; set; }

    [Column("purchase_date")]
    public DateOnly? PurchaseDate { get; set; }

    [Column("purchase_price")]
    [Precision(10, 2)]
    public decimal? PurchasePrice { get; set; }

    [Column("purchase_currency_id")]
    public Guid? PurchaseCurrencyId { get; set; }

    [ForeignKey("CategoryId")]
    [InverseProperty("UserThings")]
    public virtual UserThingCategory Category { get; set; } = null!;

    [ForeignKey("DimensionUnitId")]
    [InverseProperty("UserThingDimensionUnits")]
    public virtual Unit? DimensionUnit { get; set; }

    [ForeignKey("PurchaseCurrencyId")]
    [InverseProperty("UserThings")]
    public virtual Currency? PurchaseCurrency { get; set; }

    [InverseProperty("UserThing")]
    public virtual ICollection<TripUserThing> TripUserThings { get; set; } = new List<TripUserThing>();

    [ForeignKey("WeightUnitId")]
    [InverseProperty("UserThingWeightUnits")]
    public virtual Unit? WeightUnit { get; set; }
}
