using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Plantour.Models;

[Table("invitations", Schema = "plantour")]
[Index("AccessCode", Name = "invitations_access_code_key", IsUnique = true)]
[Index("InviteToken", Name = "invitations_invite_token_key", IsUnique = true)]
public partial class Invitation
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("trip_id")]
    public Guid TripId { get; set; }

    [Column("inviter_id")]
    public Guid InviterId { get; set; }

    [Column("invitee_id")]
    public Guid InviteeId { get; set; }

    [Column("invite_token")]
    public string InviteToken { get; set; } = null!;

    [Column("access_code")]
    [StringLength(8)]
    public string AccessCode { get; set; } = null!;

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

    [Column("subject")]
    [StringLength(200)]
    public string Subject { get; set; } = null!;

    [Column("message")]
    public string Message { get; set; } = null!;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("expires_at")]
    public DateTime ExpiresAt { get; set; }

    [Column("accepted_at")]
    public DateTime? AcceptedAt { get; set; }

    [Column("refused_at")]
    public DateTime? RefusedAt { get; set; }

    [Column("sent_at")]
    public DateTime? SentAt { get; set; }

    [Column("communication_type_id")]
    public Guid? CommunicationTypeId { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    [ForeignKey("CommunicationTypeId")]
    [InverseProperty("Invitations")]
    public virtual CommunicationType? CommunicationType { get; set; }

    [ForeignKey("InviteeId")]
    [InverseProperty("InvitationInvitees")]
    public virtual Traveler Invitee { get; set; } = null!;

    [ForeignKey("InviterId")]
    [InverseProperty("InvitationInviters")]
    public virtual Traveler Inviter { get; set; } = null!;

    [ForeignKey("TripId")]
    [InverseProperty("Invitations")]
    public virtual Trip Trip { get; set; } = null!;
}
