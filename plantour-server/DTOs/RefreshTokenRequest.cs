using System.ComponentModel.DataAnnotations;

namespace plantour_server.DTOs;

public class RefreshTokenRequest
{
    [Required]
    public string RefreshToken { get; set; } = null!;
}
