using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using plantour_maintenance_server.DTOs;
using plantour_maintenance_server.Services.Interfaces;

namespace plantour_maintenance_server.Controllers;

[ApiController]
[Route("auth")]
public class AuthController(IAuthService authService) : ControllerBase
{
    private readonly IAuthService _authService = authService;

    [HttpPost("sign-in")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> SignIn([FromBody] SignInRequest request, CancellationToken cancellationToken)
    {
        var response = await _authService.SignInAsync(request, cancellationToken);
        return Ok(response);
    }

    [HttpPost("hash-password")]
    public async Task<ActionResult<HashPasswordResponse>> HashPassword([FromBody] HashPasswordRequest request, CancellationToken cancellationToken)
    {
        var hash = await _authService.HashPasswordAsync(request.Password, cancellationToken);
        return Ok(new HashPasswordResponse
        {
            HashedPassword = hash
        });
    }
}