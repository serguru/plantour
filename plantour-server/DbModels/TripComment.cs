using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("trip_comments", Schema = "plantour")]
[Index("TripId", Name = "idx_trip_comments_trip_id")]
public partial class TripComment
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("trip_id")]
    public Guid TripId { get; set; }

    [Column("trip_user_id")]
    public Guid? TripUserId { get; set; }

    [Column("comment")]
    public string Comment { get; set; } = null!;

    [Column("published_at", TypeName = "timestamp without time zone")]
    public DateTime PublishedAt { get; set; }

    [ForeignKey("TripId")]
    [InverseProperty("TripComments")]
    public virtual Trip Trip { get; set; } = null!;

    [ForeignKey("TripUserId")]
    [InverseProperty("TripComments")]
    public virtual TripUser? TripUser { get; set; }
}
