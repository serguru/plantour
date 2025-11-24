using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Plantour.Models;

[Table("traveler_things", Schema = "plantour")]
[Index("CategoryId", Name = "idx_traveler_things_category_id")]
public partial class TravelerThing
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
    [InverseProperty("TravelerThings")]
    public virtual TravelerThingCategory Category { get; set; } = null!;

    [ForeignKey("DimensionUnitId")]
    [InverseProperty("TravelerThingDimensionUnits")]
    public virtual Unit? DimensionUnit { get; set; }

    [ForeignKey("PurchaseCurrencyId")]
    [InverseProperty("TravelerThings")]
    public virtual Currency? PurchaseCurrency { get; set; }

    [InverseProperty("TravelerThing")]
    public virtual ICollection<TripTravelerThing> TripTravelerThings { get; set; } = new List<TripTravelerThing>();

    [ForeignKey("WeightUnitId")]
    [InverseProperty("TravelerThingWeightUnits")]
    public virtual Unit? WeightUnit { get; set; }
}
