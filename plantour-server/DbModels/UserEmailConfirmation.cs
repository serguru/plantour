using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("user_email_confirmations", Schema = "plantour")]
[Index(nameof(UserId), Name = "user_email_confirmations_user_id_idx", IsUnique = true)]
public class UserEmailConfirmation
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("created_at")]
    public DateTime CreatedAtUtc { get; set; }

    [Column("confirmed_at")]
    public DateTime? ConfirmedAtUtc { get; set; }

    [Column("last_sent_at")]
    public DateTime? LastSentAtUtc { get; set; }

    [ForeignKey(nameof(UserId))]
    public virtual User User { get; set; } = null!;
}
