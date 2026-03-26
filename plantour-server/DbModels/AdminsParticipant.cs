using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("admins_participants", Schema = "plantour_v2")]
[Index("AccessCodeHash", Name = "admins_participants_access_code_hash_key", IsUnique = true)]
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

    [Column("access_code_hash")]
    [StringLength(64)]
    public string AccessCodeHash { get; set; } = null!;

    [Column("notes")]
    public string? Notes { get; set; }

    [ForeignKey("AdminId")]
    [InverseProperty("AdminsParticipantAdmins")]
    public virtual User Admin { get; set; } = null!;

    [InverseProperty("AdminParticipant")]
    public virtual ICollection<Invitation> Invitations { get; set; } = new List<Invitation>();

    [ForeignKey("ParticipantId")]
    [InverseProperty("AdminsParticipantParticipants")]
    public virtual User Participant { get; set; } = null!;

    [InverseProperty("AdminParticipant")]
    public virtual ICollection<TripUser> TripUsers { get; set; } = new List<TripUser>();
}
