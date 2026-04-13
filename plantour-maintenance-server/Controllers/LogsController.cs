using Microsoft.AspNetCore.Mvc;
using plantour_maintenance_server.DTOs;
using plantour_maintenance_server.Middleware;
using plantour_maintenance_server.Services.Interfaces;

namespace plantour_maintenance_server.Controllers;

[ApiController]
[Route("logs")]
public sealed class LogsController(ILogsService logsService) : ControllerBase
{
    private readonly ILogsService _logsService = logsService;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<LogRowDto>>> Get(
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
                "Both from and to must be specified when filtering logs by date.");

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

        var result = await _logsService.GetAsync(from, to, cancellationToken);
        return Ok(result);
    }
}