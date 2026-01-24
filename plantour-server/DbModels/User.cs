using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

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

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("active")]
    public bool Active { get; set; }

    [Column("temporary")]
    public bool Temporary { get; set; }

    [InverseProperty("Admin")]
    public virtual ICollection<AdminsParticipant> AdminsParticipantAdmins { get; set; } = new List<AdminsParticipant>();

    [InverseProperty("Participant")]
    public virtual ICollection<AdminsParticipant> AdminsParticipantParticipants { get; set; } = new List<AdminsParticipant>();

    [InverseProperty("User")]
    public virtual ICollection<Trip> Trips { get; set; } = new List<Trip>();

    [InverseProperty("User")]
    public virtual ICollection<UserPackage> UserPackages { get; set; } = new List<UserPackage>();

    [InverseProperty("User")]
    public virtual ICollection<UserThing> UserThings { get; set; } = new List<UserThing>();
}
