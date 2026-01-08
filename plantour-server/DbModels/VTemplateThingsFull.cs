using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Keyless]
public partial class VTemplateThingsFull
{
    [Column("thing_id")]
    public Guid? ThingId { get; set; }

    [Column("thing_name")]
    [StringLength(200)]
    public string? ThingName { get; set; }

    [Column("category")]
    [StringLength(50)]
    public string? Category { get; set; }

    [Column("units")]
    [StringLength(50)]
    public string? Units { get; set; }

    [Column("value")]
    [Precision(10, 3)]
    public decimal? Value { get; set; }

    [Column("thing_notes")]
    public string? ThingNotes { get; set; }

    [Column("template_id")]
    public Guid? TemplateId { get; set; }

    [Column("template_name")]
    public string? TemplateName { get; set; }

    [Column("activity_name")]
    public string? ActivityName { get; set; }

    [Column("temperature_range_name")]
    public string? TemperatureRangeName { get; set; }

    [Column("fromtemp")]
    public int? Fromtemp { get; set; }

    [Column("totemp")]
    public int? Totemp { get; set; }

    [Column("age_range_name")]
    public string? AgeRangeName { get; set; }

    [Column("fromage")]
    public int? Fromage { get; set; }

    [Column("toage")]
    public int? Toage { get; set; }
}
