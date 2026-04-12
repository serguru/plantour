using Microsoft.AspNetCore.Mvc;
using plantour_maintenance_server.DTOs;
using plantour_maintenance_server.Services.Interfaces;

namespace plantour_maintenance_server.Controllers;

[ApiController]
[Route("visitor-activity")]
public sealed class VisitorActivityController(IVisitorActivityService visitorActivityService) : ControllerBase
{
    private readonly IVisitorActivityService _visitorActivityService = visitorActivityService;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<VisitorActivityRowDto>>> Get(
        [FromQuery] DateTimeOffset from,
        [FromQuery] DateTimeOffset to,
        CancellationToken cancellationToken)
    {
        var result = await _visitorActivityService.GetAsync(from, to, cancellationToken);
        return Ok(result);
    }
}