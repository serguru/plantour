using System.ComponentModel.DataAnnotations;

namespace plantour_server.DTOs;

public class AutoAssignSharedExpensesRequest
{
    [Required]
    public Guid TripId { get; set; }

    [Required]
    [MinLength(1)]
    public Guid[] TripUserIds { get; set; } = [];
}