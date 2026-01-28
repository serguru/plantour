using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("user_refresh_tokens", Schema = "plantour")]
[Index(nameof(UserId), nameof(TokenHash), Name = "user_refresh_tokens_user_token_hash_idx", IsUnique = true)]
public class UserRefreshToken
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("role")]
    [MaxLength(50)]
    public string Role { get; set; } = null!;

    [Column("admin_id")]
    public Guid AdminId { get; set; }

    [Column("token_hash")]
    [MaxLength(256)]
    public string TokenHash { get; set; } = null!;

    [Column("created_at")]
    public DateTime CreatedAtUtc { get; set; }

    [Column("expires_at")]
    public DateTime ExpiresAtUtc { get; set; }

    [Column("revoked_at")]
    public DateTime? RevokedAtUtc { get; set; }

    [Column("replaced_by_token_hash")]
    [MaxLength(256)]
    public string? ReplacedByTokenHash { get; set; }

    [Column("created_by_ip")]
    [MaxLength(100)]
    public string? CreatedByIp { get; set; }

    [Column("revoked_by_ip")]
    [MaxLength(100)]
    public string? RevokedByIp { get; set; }

    [ForeignKey(nameof(UserId))]
    public virtual User User { get; set; } = null!;
}
