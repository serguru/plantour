using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("users", Schema = "plantour")]
[Index("Email", Name = "users_email_key", IsUnique = true)]
[Index("FacebookUserId", Name = "users_facebook_user_id_key", IsUnique = true)]
[Index("GoogleSub", Name = "users_google_sub_key", IsUnique = true)]
[Index("PaddleSubscriptionId", Name = "users_paddle_subscription_id_key", IsUnique = true)]
public partial class User
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("email")]
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

    [Column("google_sub")]
    public string? GoogleSub { get; set; }

    [Column("facebook_user_id")]
    public string? FacebookUserId { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    [Column("created_at", TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; }

    [Column("access_type_id")]
    public Guid AccessTypeId { get; set; }

    [Column("price_enum_id")]
    public int? PriceEnumId { get; set; }

    [Column("paddle_subscription_id")]
    public string? PaddleSubscriptionId { get; set; }

    [ForeignKey("AccessTypeId")]
    [InverseProperty("Users")]
    public virtual AccessType AccessType { get; set; } = null!;

    [InverseProperty("Admin")]
    public virtual ICollection<AdminsParticipant> AdminsParticipantAdmins { get; set; } = new List<AdminsParticipant>();

    [InverseProperty("Participant")]
    public virtual ICollection<AdminsParticipant> AdminsParticipantParticipants { get; set; } = new List<AdminsParticipant>();

    [InverseProperty("IdNavigation")]
    public virtual AiPromptCheck? AiPromptCheck { get; set; }

    [InverseProperty("User")]
    public virtual ICollection<AiPrompt> AiPrompts { get; set; } = new List<AiPrompt>();

    [ForeignKey("PriceEnumId")]
    [InverseProperty("Users")]
    public virtual Price? PriceEnum { get; set; }

    [InverseProperty("User")]
    public virtual ICollection<Trip> Trips { get; set; } = new List<Trip>();

    [InverseProperty("User")]
    public virtual UserEmailConfirmation? UserEmailConfirmation { get; set; }

    [InverseProperty("User")]
    public virtual ICollection<UserPackage> UserPackages { get; set; } = new List<UserPackage>();

    [InverseProperty("User")]
    public virtual ICollection<UserThing> UserThings { get; set; } = new List<UserThing>();
}
