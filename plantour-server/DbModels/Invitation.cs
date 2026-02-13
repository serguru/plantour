using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("invitations", Schema = "plantour")]
public partial class Invitation
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("admin_participant_id")]
    public Guid AdminParticipantId { get; set; }

    [Column("access_code")]
    public string? AccessCode { get; set; }

    [Column("first_name")]
    public string? FirstName { get; set; }

    [Column("last_name")]
    public string? LastName { get; set; }

    [Column("email")]
    public string? Email { get; set; }

    [Column("phone")]
    public string? Phone { get; set; }

    [Column("subject")]
    public string Subject { get; set; } = null!;

    [Column("message")]
    public string Message { get; set; } = null!;

    [Column("created_at", TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; }

    [Column("expires_at", TypeName = "timestamp without time zone")]
    public DateTime? ExpiresAt { get; set; }

    [Column("accepted_at", TypeName = "timestamp without time zone")]
    public DateTime? AcceptedAt { get; set; }

    [Column("refused_at", TypeName = "timestamp without time zone")]
    public DateTime? RefusedAt { get; set; }

    [Column("sent_at", TypeName = "timestamp without time zone")]
    public DateTime? SentAt { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    [ForeignKey("AdminParticipantId")]
    [InverseProperty("Invitations")]
    public virtual AdminsParticipant AdminParticipant { get; set; } = null!;
}
