using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Plantour.Models;

[Table("travelers", Schema = "plantour")]
[Index("AdminId", Name = "idx_travelers_admin_id")]
[Index("UserId", Name = "idx_travelers_user_id")]
[Index("UserId", Name = "travelers_user_id_key", IsUnique = true)]
public partial class Traveler
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    [StringLength(100)]
    public string? UserId { get; set; }

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

    [ForeignKey("AdminId")]
    [InverseProperty("InverseAdmin")]
    public virtual Traveler? Admin { get; set; }

    [InverseProperty("Admin")]
    public virtual ICollection<Traveler> InverseAdmin { get; set; } = new List<Traveler>();

    [InverseProperty("Invitee")]
    public virtual ICollection<Invitation> InvitationInvitees { get; set; } = new List<Invitation>();

    [InverseProperty("Inviter")]
    public virtual ICollection<Invitation> InvitationInviters { get; set; } = new List<Invitation>();

    [InverseProperty("Traveler")]
    public virtual ICollection<TravelerPackageCategory> TravelerPackageCategories { get; set; } = new List<TravelerPackageCategory>();

    [InverseProperty("Traveler")]
    public virtual ICollection<TravelerThingCategory> TravelerThingCategories { get; set; } = new List<TravelerThingCategory>();

    [InverseProperty("Traveler")]
    public virtual ICollection<TripTraveler> TripTravelers { get; set; } = new List<TripTraveler>();

    [InverseProperty("Owner")]
    public virtual ICollection<Trip> Trips { get; set; } = new List<Trip>();
}
