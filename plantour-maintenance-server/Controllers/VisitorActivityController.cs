using Microsoft.AspNetCore.Mvc;
using plantour_maintenance_server.DTOs;
using plantour_maintenance_server.Middleware;
using plantour_maintenance_server.Services.Interfaces;

namespace plantour_maintenance_server.Controllers;

[ApiController]
[Route("visitor-activity")]
public sealed class VisitorActivityController(IVisitorActivityService visitorActivityService) : ControllerBase
{
    private readonly IVisitorActivityService _visitorActivityService = visitorActivityService;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<VisitorActivityRowDto>>> Get(
        [FromQuery] DateTimeOffset? from,
        [FromQuery] DateTimeOffset? to,
        CancellationToken cancellationToken)
    {
        if (from.HasValue != to.HasValue)
        {
            await ErrorResponse.WriteErrorResponse(
                HttpContext,
                StatusCodes.Status400BadRequest,
                "INVALID_PERIOD",
                "Both from and to must be specified when filtering visitor activity by date.");

            return new EmptyResult();
        }

        if (from.HasValue && to.HasValue && from > to)
        {
            await ErrorResponse.WriteErrorResponse(
                HttpContext,
                StatusCodes.Status400BadRequest,
                "INVALID_PERIOD",
                "The end of the period must be later than or equal to the start.");

            return new EmptyResult();
        }

        var result = await _visitorActivityService.GetAsync(from, to, cancellationToken);
        return Ok(result);
    }
}