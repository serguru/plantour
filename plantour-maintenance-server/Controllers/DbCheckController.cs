using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using plantour_maintenance_server.Services.Interfaces;

namespace plantour_maintenance_server.Controllers;

[ApiController]
[Route("")]
public class DbCheckController(IDbCheckService dbCheckService) : ControllerBase
{
    private readonly IDbCheckService _dbCheckService = dbCheckService;

    [HttpGet("db-check")]
    [AllowAnonymous]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        await _dbCheckService.CheckAsync(cancellationToken);
        return Ok(new { status = "Plantour Maintenance DB OK" });
    }
}