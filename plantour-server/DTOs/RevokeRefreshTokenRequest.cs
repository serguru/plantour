using System.ComponentModel.DataAnnotations;

namespace plantour_server.DTOs;

public class RevokeRefreshTokenRequest
{
    [Required]
    public string RefreshToken { get; set; } = null!;
}
