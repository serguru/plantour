using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using plantour_server.Attributes;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Services;

namespace plantour_server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUsersService _authService;
    private readonly ITemporaryUserService _temporaryUserService;

    public UsersController(IUsersService authService, ITemporaryUserService temporaryUserService)
    {
        _authService = authService;
        _temporaryUserService = temporaryUserService;
    }

    #region Admin Endpoints

    [HttpPost("admin/signup")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> SignUpAdmin([FromBody] SignUpRequest request)
    {
            var response = await _authService.SignUpAsync(request);
            return Ok(response);
    }

    [HttpPost("admin/signin")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> SignInAdmin([FromBody] SignInRequest request)
    {
            var response = await _authService.SignInAsync(request);
            return Ok(response);
    }

    #endregion

    #region Participant Endpoints

    [HttpPost("participant/signup")]
    [AdminOnly]
    public async Task<ActionResult<AdminsParticipantDto>> SignUpParticipant([FromBody] SignUpParticipantRequest request)
    {
            AdminsParticipantDto result = await _authService.SignUpParticipantAsync(request);
            return Ok(result);
    }

    [HttpPost("participant/signin")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> SignInParticipant([FromBody] SignInParticipantRequest request)
    {
            var response = await _authService.SignInParticipantAsync(request);
            return Ok(response);
    }

    #endregion

    #region Temporary User Endpoints

    [HttpPost("create-temporary-user")]
    [AllowAnonymous]
    public async Task<ActionResult<CreateTemporaryUserResponse>> CreateTemporaryUser()
    {
        var response = await _temporaryUserService.CreateTemporaryUserAsync();
        return Ok(response);
    }

    #endregion

    #region Common Endpoints

    [Authorize]
    [HttpGet("validate")]
    public async Task<IActionResult> ValidateToken()
    {
        var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
        var isValid = await _authService.ValidateTokenAsync(token);
        return Ok(new { isValid });
    }

    #endregion
}
