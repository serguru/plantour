using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using plantour_maintenance_server.DTOs;
using plantour_maintenance_server.Services.Interfaces;

namespace plantour_maintenance_server.Controllers;

[ApiController]
[Route("users")]
public class UsersController(IUsersService usersService) : ControllerBase
{
    private readonly IUsersService _usersService = usersService;

    [HttpGet("health-check")]
    [AllowAnonymous]
    public IActionResult GetHealthCheck()
    {
        return Ok(new { status = "Plantour Maintenance API OK" });
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<UserDto>>> GetAll(CancellationToken cancellationToken)
    {
        var users = await _usersService.GetAllAsync(cancellationToken);
        return Ok(users);
    }

    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> GetCurrent(CancellationToken cancellationToken)
    {
        var user = await _usersService.GetCurrentAsync(cancellationToken);
        return Ok(user);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<UserDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var user = await _usersService.GetByIdAsync(id, cancellationToken);
        return Ok(user);
    }
}