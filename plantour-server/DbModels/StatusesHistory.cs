using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("statuses_history", Schema = "plantour")]
public partial class StatusesHistory
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("access_status_id")]
    public Guid AccessStatusId { get; set; }

    [Column("start_date")]
    public DateTime StartDate { get; set; }

    [Column("end_date")]
    public DateTime EndDate { get; set; }

    [ForeignKey("AccessStatusId")]
    [InverseProperty("StatusesHistories")]
    public virtual AccessStatus AccessStatus { get; set; } = null!;

    [ForeignKey("UserId")]
    [InverseProperty("StatusesHistories")]
    public virtual User User { get; set; } = null!;
}
