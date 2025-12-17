using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("admins_participants", Schema = "plantour")]
[Index("AdminId", "ParticipantId", Name = "idx_admins_participants_admin_id_participant_id", IsUnique = true)]
public partial class AdminsParticipant
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("admin_id")]
    public Guid AdminId { get; set; }

    [Column("participant_id")]
    public Guid ParticipantId { get; set; }

    [Column("participant_status_id")]
    public Guid ParticipantStatusId { get; set; }

    [Column("access_code_hash")]
    public byte[]? AccessCodeHash { get; set; }

    [Column("access_code_salt")]
    public byte[]? AccessCodeSalt { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    [ForeignKey("AdminId")]
    [InverseProperty("AdminsParticipantAdmins")]
    public virtual User Admin { get; set; } = null!;

    [ForeignKey("ParticipantId")]
    [InverseProperty("AdminsParticipantParticipants")]
    public virtual User Participant { get; set; } = null!;

    [ForeignKey("ParticipantStatusId")]
    [InverseProperty("AdminsParticipants")]
    public virtual ParticipantStatus ParticipantStatus { get; set; } = null!;

    [InverseProperty("AdminParticipant")]
    public virtual ICollection<TripUser> TripUsers { get; set; } = new List<TripUser>();
}
