using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("ai_trip_plans", Schema = "plantour")]
[Index("UserId", "Question", Name = "idx_ai_trip_plans_question", IsUnique = true)]
public partial class AiTripPlan
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("question")]
    public string Question { get; set; } = null!;

    [Column("plan", TypeName = "json")]
    public string Plan { get; set; } = null!;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("AiTripPlans")]
    public virtual User User { get; set; } = null!;
}
