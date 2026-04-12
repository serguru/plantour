using Microsoft.AspNetCore.Mvc;
using plantour_maintenance_server.DTOs;
using plantour_maintenance_server.Services.Interfaces;

namespace plantour_maintenance_server.Controllers;

[ApiController]
[Route("logs")]
public sealed class LogsController(ILogsService logsService) : ControllerBase
{
    private readonly ILogsService _logsService = logsService;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<LogRowDto>>> Get(
        [FromQuery] DateTimeOffset from,
        [FromQuery] DateTimeOffset to,
        CancellationToken cancellationToken)
    {
        var result = await _logsService.GetAsync(from, to, cancellationToken);
        return Ok(result);
    }
}