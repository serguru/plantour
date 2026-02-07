using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace plantour_server.DbModels;

[Table("user_refresh_tokens", Schema = "plantour")]
[Index("TokenHash", Name = "idx_user_refresh_tokens_token_hash")]
[Index("UserId", Name = "idx_user_refresh_tokens_user_id")]
[Index("UserId", "TokenHash", Name = "idx_user_refresh_tokens_user_token_hash", IsUnique = true)]
public partial class UserRefreshToken
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("role")]
    public string Role { get; set; } = null!;

    [Column("admin_id")]
    public Guid AdminId { get; set; }

    [Column("token_hash")]
    public string TokenHash { get; set; } = null!;

    [Column("created_at", TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; }

    [Column("expires_at", TypeName = "timestamp without time zone")]
    public DateTime ExpiresAt { get; set; }

    [Column("revoked_at", TypeName = "timestamp without time zone")]
    public DateTime? RevokedAt { get; set; }

    [Column("replaced_by_token_hash")]
    public string? ReplacedByTokenHash { get; set; }

    [Column("created_by_ip")]
    public string? CreatedByIp { get; set; }

    [Column("revoked_by_ip")]
    public string? RevokedByIp { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("UserRefreshTokens")]
    public virtual User User { get; set; } = null!;
}
