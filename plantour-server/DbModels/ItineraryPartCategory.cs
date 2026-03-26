using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("itinerary_part_categories", Schema = "plantour_v2")]
[Index("Name", Name = "itinerary_part_categories_name_key", IsUnique = true)]
public partial class ItineraryPartCategory
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("name")]
    public string Name { get; set; } = null!;
}
