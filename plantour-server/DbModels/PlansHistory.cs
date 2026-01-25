using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("plans_history", Schema = "plantour")]
public partial class PlansHistory
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("plan_id")]
    public Guid PlanId { get; set; }

    [Column("start_date")]
    public DateTime StartDate { get; set; }

    [Column("end_date")]
    public DateTime EndDate { get; set; }

    [ForeignKey("PlanId")]
    [InverseProperty("PlansHistories")]
    public virtual Plan Plan { get; set; } = null!;

    [ForeignKey("UserId")]
    [InverseProperty("PlansHistories")]
    public virtual User User { get; set; } = null!;
}
