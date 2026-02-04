using Microsoft.AspNetCore.Mvc;
using plantour_server.Attributes;
using plantour_server.DTOs;
using plantour_server.Services;

namespace plantour_server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _service;

    public DashboardController(IDashboardService service)
    {
        _service = service;
    }

    [HttpGet("trip/{tripId}")]
    [AdminOrParticipant]
    public async Task<ActionResult<DashboardTripDto>> GetDashboardTripDto(Guid tripId)
    {
        var dto = await _service.GetDashboardTripDtoAsync(tripId);
        return Ok(dto);
    }

    [HttpGet("user-trip/{tripId}")]
    [AdminOrParticipant]
    public async Task<ActionResult<DashboardUserTripDto>> GetDashboardUserTripDto(Guid tripId)
    {
        var dto = await _service.GetDashboardUserTripDtoAsync(tripId);
        return Ok(dto);
    }
}
