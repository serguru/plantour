using System.ComponentModel.DataAnnotations;

namespace plantour_server.DTOs;

public class UpdateProfileRequest
{
    [EmailAddress]
    [StringLength(255)]
    public string? Email { get; set; }

    [StringLength(100)]
    public string? FirstName { get; set; }

    [StringLength(100)]
    public string? LastName { get; set; }

    [StringLength(50)]
    public string? Phone { get; set; }
}
