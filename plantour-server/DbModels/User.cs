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
    public string? FirstName { get; set; }

    [Column("last_name")]
    public string? LastName { get; set; }

    [Column("phone")]
    public string? Phone { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    [Column("created_at", TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; }

    [Column("discount")]
    public int Discount { get; set; }

    [Column("plan_id")]
    public Guid PlanId { get; set; }

    [Column("access_type_id")]
    public Guid AccessTypeId { get; set; }

    [ForeignKey("AccessTypeId")]
    [InverseProperty("Users")]
    public virtual AccessType AccessType { get; set; } = null!;

    [InverseProperty("Admin")]
    public virtual ICollection<AdminsParticipant> AdminsParticipantAdmins { get; set; } = new List<AdminsParticipant>();

    [InverseProperty("Participant")]
    public virtual ICollection<AdminsParticipant> AdminsParticipantParticipants { get; set; } = new List<AdminsParticipant>();

    [InverseProperty("User")]
    public virtual ICollection<AiPrompt> AiPrompts { get; set; } = new List<AiPrompt>();

    [ForeignKey("PlanId")]
    [InverseProperty("Users")]
    public virtual Plan Plan { get; set; } = null!;

    [InverseProperty("User")]
    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();

    [InverseProperty("User")]
    public virtual ICollection<Trip> Trips { get; set; } = new List<Trip>();

    [InverseProperty("User")]
    public virtual UserEmailConfirmation? UserEmailConfirmation { get; set; }

    [InverseProperty("User")]
    public virtual ICollection<UserPackage> UserPackages { get; set; } = new List<UserPackage>();

    [InverseProperty("User")]
    public virtual ICollection<UserRefreshToken> UserRefreshTokens { get; set; } = new List<UserRefreshToken>();

    [InverseProperty("User")]
    public virtual ICollection<UserThing> UserThings { get; set; } = new List<UserThing>();
}
