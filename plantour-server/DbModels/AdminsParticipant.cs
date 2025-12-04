using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("admins_participants", Schema = "plantour")]
[Index("AccessCode", Name = "admins_participants_access_code_key", IsUnique = true)]
[Index("AdminId", "ParticipantId", Name = "idx_admins_participants", IsUnique = true)]
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
    public Guid? ParticipantStatusId { get; set; }

    [Column("access_code")]
    [StringLength(8)]
    public string AccessCode { get; set; } = null!;

    [ForeignKey("AdminId")]
    [InverseProperty("AdminsParticipantAdmins")]
    public virtual User Admin { get; set; } = null!;

    [ForeignKey("ParticipantId")]
    [InverseProperty("AdminsParticipantParticipants")]
    public virtual User Participant { get; set; } = null!;

    [ForeignKey("ParticipantStatusId")]
    [InverseProperty("AdminsParticipants")]
    public virtual ParticipantStatus? ParticipantStatus { get; set; }
}
