using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using plantour_maintenance_server.DTOs;
using plantour_maintenance_server.Middleware;
using plantour_maintenance_server.Services.Interfaces;

namespace plantour_maintenance_server.Controllers;

[ApiController]
[Route("users")]
public class UsersController(IUsersService usersService, IPlantourUsersService plantourUsersService) : ControllerBase
{
    private readonly IUsersService _usersService = usersService;
    private readonly IPlantourUsersService _plantourUsersService = plantourUsersService;

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

    [HttpGet("plantour")]
    public async Task<ActionResult<IReadOnlyList<PlantourUserRowDto>>> GetPlantourUsers(
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
                "Both from and to must be specified when filtering users by created_at.");

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

        var users = await _plantourUsersService.GetAllAsync(from, to, cancellationToken);
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

    [HttpGet("{id:guid}/comprehensive")]
    [AllowAnonymous]
    public async Task<ActionResult<ComprehensiveUserDto>> GetComprehensiveData(
        Guid id,
        CancellationToken cancellationToken)
    {
        var userData = await _plantourUsersService.GetComprehensiveDataAsync(id, cancellationToken);
        return Ok(userData);
    }
}