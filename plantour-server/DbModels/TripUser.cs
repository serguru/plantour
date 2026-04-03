using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("trip_users", Schema = "plantour")]
[Index("TripId", "AdminParticipantId", Name = "idx_trip_users_trip_id_user_id", IsUnique = true)]
public partial class TripUser
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("trip_id")]
    public Guid TripId { get; set; }

    [Column("admin_participant_id")]
    public Guid AdminParticipantId { get; set; }

    [Column("packaging_complete")]
    public bool PackagingComplete { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    [Column("nopack_weight_value")]
    [Precision(10, 3)]
    public decimal? NopackWeightValue { get; set; }

    [Column("nopack_weight_unit")]
    public string? NopackWeightUnit { get; set; }

    [Column("shared_amount")]
    [Precision(19, 2)]
    public decimal SharedAmount { get; set; }

    [Column("assigned_at")]
    public DateTime? AssignedAt { get; set; }

    [Column("assigned_deadline")]
    public DateTime? AssignedDeadline { get; set; }

    [Column("rejected")]
    public bool Rejected { get; set; }

    [ForeignKey("AdminParticipantId")]
    [InverseProperty("TripUsers")]
    public virtual AdminsParticipant AdminParticipant { get; set; } = null!;

    [ForeignKey("TripId")]
    [InverseProperty("TripUsers")]
    public virtual Trip Trip { get; set; } = null!;

    [InverseProperty("TripUser")]
    public virtual ICollection<TripActivity> TripActivities { get; set; } = new List<TripActivity>();

    [InverseProperty("TripUser")]
    public virtual ICollection<TripComment> TripComments { get; set; } = new List<TripComment>();

    [InverseProperty("TripUser")]
    public virtual ICollection<TripNote> TripNotes { get; set; } = new List<TripNote>();

    [InverseProperty("AssignedTo")]
    public virtual ICollection<TripSharedThing> TripSharedThings { get; set; } = new List<TripSharedThing>();

    [InverseProperty("AssignedTo")]
    public virtual ICollection<TripSharedTodo> TripSharedTodos { get; set; } = new List<TripSharedTodo>();

    [InverseProperty("Recipient")]
    public virtual ICollection<TripUserExpense> TripUserExpenseRecipients { get; set; } = new List<TripUserExpense>();

    [InverseProperty("TripUser")]
    public virtual ICollection<TripUserExpense> TripUserExpenseTripUsers { get; set; } = new List<TripUserExpense>();

    [InverseProperty("TripUser")]
    public virtual ICollection<TripUserImprovement> TripUserImprovements { get; set; } = new List<TripUserImprovement>();

    [InverseProperty("TripUser")]
    public virtual ICollection<TripUserPackage> TripUserPackages { get; set; } = new List<TripUserPackage>();

    [InverseProperty("TripUser")]
    public virtual ICollection<TripUserThing> TripUserThings { get; set; } = new List<TripUserThing>();

    [InverseProperty("TripUser")]
    public virtual ICollection<TripUserTodo> TripUserTodos { get; set; } = new List<TripUserTodo>();
}
