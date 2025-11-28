using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.Models;

[Table("users", Schema = "plantour")]
[Index("Email", Name = "users_email_key", IsUnique = true)]
public partial class User
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("email")]
    [StringLength(255)]
    public string Email { get; set; } = null!;

    [Column("password_hash")]
    public byte[]? PasswordHash { get; set; }

    [Column("password_salt")]
    public byte[]? PasswordSalt { get; set; }

    [Column("first_name")]
    [StringLength(100)]
    public string? FirstName { get; set; }

    [Column("last_name")]
    [StringLength(100)]
    public string? LastName { get; set; }

    [Column("phone")]
    [StringLength(50)]
    public string? Phone { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    [InverseProperty("Admin")]
    public virtual ICollection<AdminsParticipant> AdminsParticipantAdmins { get; set; } = new List<AdminsParticipant>();

    [InverseProperty("Participant")]
    public virtual ICollection<AdminsParticipant> AdminsParticipantParticipants { get; set; } = new List<AdminsParticipant>();

    [InverseProperty("Invitee")]
    public virtual ICollection<Invitation> InvitationInvitees { get; set; } = new List<Invitation>();

    [InverseProperty("Inviter")]
    public virtual ICollection<Invitation> InvitationInviters { get; set; } = new List<Invitation>();

    [InverseProperty("User")]
    public virtual ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();

    [InverseProperty("User")]
    public virtual ICollection<TripUser> TripUsers { get; set; } = new List<TripUser>();

    [InverseProperty("Owner")]
    public virtual ICollection<Trip> Trips { get; set; } = new List<Trip>();

    [InverseProperty("User")]
    public virtual ICollection<UserPackageCategory> UserPackageCategories { get; set; } = new List<UserPackageCategory>();

    [InverseProperty("User")]
    public virtual ICollection<UserThingCategory> UserThingCategories { get; set; } = new List<UserThingCategory>();
}
