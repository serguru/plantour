using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Plantour.Models;

[Table("tour", Schema = "plantour")]
public partial class Tour
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("name")]
    public string Name { get; set; } = null!;

    [Column("status")]
    public string Status { get; set; } = null!;

    [Column("start_date")]
    public DateOnly? StartDate { get; set; }

    [Column("end_date")]
    public DateOnly? EndDate { get; set; }

    [Column("tour_data", TypeName = "jsonb")]
    public string TourData { get; set; } = null!;

    [Column("version")]
    public int Version { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }
}
