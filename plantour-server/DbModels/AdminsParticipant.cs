using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("admins_participants", Schema = "plantour")]
[Index("AccessCode", Name = "admins_participants_access_code_key", IsUnique = true)]
[Index("AdminId", "ParticipantId", Name = "idx_admins_participants_admin_id_participant_id", IsUnique = true)]
[Index("AdminId", "Email", Name = "idx_admins_participants_email_admin_id_email", IsUnique = true)]
public partial class AdminsParticipant
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("admin_id")]
    public Guid AdminId { get; set; }

    [Column("participant_id")]
    public Guid ParticipantId { get; set; }

    [Column("participant_status")]
    [StringLength(50)]
    public string? ParticipantStatus { get; set; }

    [Column("access_code")]
    [StringLength(8)]
    public string AccessCode { get; set; } = null!;

    [Column("email")]
    [StringLength(255)]
    public string Email { get; set; } = null!;

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

    [ForeignKey("AdminId")]
    [InverseProperty("AdminsParticipantAdmins")]
    public virtual User Admin { get; set; } = null!;

    [ForeignKey("ParticipantId")]
    [InverseProperty("AdminsParticipantParticipants")]
    public virtual User Participant { get; set; } = null!;

    [InverseProperty("AdminParticipant")]
    public virtual ICollection<TripUser> TripUsers { get; set; } = new List<TripUser>();
}
