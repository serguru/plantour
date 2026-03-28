using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("trip_notes", Schema = "plantour")]
public partial class TripNote
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("trip_user_id")]
    public Guid? TripUserId { get; set; }

    [Column("trip_activity_id")]
    public Guid? TripActivityId { get; set; }

    [Column("title")]
    public string Title { get; set; } = null!;

    [Column("content_json", TypeName = "jsonb")]
    public string? ContentJson { get; set; }

    [Column("note_order")]
    public int? NoteOrder { get; set; }

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [ForeignKey("TripActivityId")]
    [InverseProperty("TripNotes")]
    public virtual TripActivity? TripActivity { get; set; }

    [ForeignKey("TripUserId")]
    [InverseProperty("TripNotes")]
    public virtual TripUser? TripUser { get; set; }
}
