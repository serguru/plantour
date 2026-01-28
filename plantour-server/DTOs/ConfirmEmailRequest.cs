using System;
using System.ComponentModel.DataAnnotations;

namespace plantour_server.DTOs;

public class ConfirmEmailRequest
{
    [Required]
    public Guid UserId { get; set; }

    [Required]
    public string Token { get; set; } = null!;
}
