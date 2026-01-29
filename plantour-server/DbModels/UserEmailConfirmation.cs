using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("user_email_confirmations", Schema = "plantour")]
[Index("UserId", Name = "idx_user_email_confirmations_user_id", IsUnique = true)]
public partial class UserEmailConfirmation
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("confirmed_at")]
    public DateTime? ConfirmedAt { get; set; }

    [Column("last_sent_at")]
    public DateTime? LastSentAt { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("UserEmailConfirmation")]
    public virtual User User { get; set; } = null!;
}
