using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Plantour.Models;

[Table("travelers", Schema = "plantour")]
[Index("AdminId", Name = "idx_travelers_admin_id")]
[Index("UserId", Name = "travelers_user_id_key", IsUnique = true)]
public partial class Traveler
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Required]
    [Column("user_id")]
    public Guid? UserId { get; set; }

    [Column("admin_id")]
    public Guid? AdminId { get; set; }

    [Column("first_name")]
    [StringLength(100)]
    public string? FirstName { get; set; }

    [Column("last_name")]
    [StringLength(100)]
    public string? LastName { get; set; }

    [Column("email")]
    [StringLength(255)]
    public string? Email { get; set; }

    [Column("phone")]
    [StringLength(50)]
    public string? Phone { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    [Column("participant_code")]
    [StringLength(10)]
    public string? ParticipantCode { get; set; }

    [ForeignKey("AdminId")]
    [InverseProperty("InverseAdmin")]
    public virtual Traveler? Admin { get; set; }

    [InverseProperty("Admin")]
    public virtual ICollection<Traveler> InverseAdmin { get; set; } = new List<Traveler>();

    [InverseProperty("Traveler")]
    public virtual ICollection<PackageCategoriesJ> PackageCategoriesJs { get; set; } = new List<PackageCategoriesJ>();

    [InverseProperty("Traveler")]
    public virtual ICollection<ThingCategoriesJ> ThingCategoriesJs { get; set; } = new List<ThingCategoriesJ>();

    [InverseProperty("Traveler")]
    public virtual ICollection<TripTravelersJ> TripTravelersJs { get; set; } = new List<TripTravelersJ>();

    [InverseProperty("User")]
    public virtual ICollection<TripsJ> TripsJs { get; set; } = new List<TripsJ>();
}
