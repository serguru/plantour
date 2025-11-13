using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using pack_api.Infrastructure.Supabase;
using pack_api.Infrastructure.Supabase.Models;

namespace pack_api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ISupabaseAuthService _auth;

    public AuthController(ISupabaseAuthService auth) => _auth = auth;

    // Public: sign up
    [HttpPost("signup")]
    [AllowAnonymous]
    public async Task<IActionResult> SignUp([FromBody] SignUpRequest req, CancellationToken ct)
    {
        var result = await _auth.SignUpAsync(req, ct);
        // return tokens to client (secure client-side storage recommended)
        return Ok(result);
    }

    // Public: sign in
    [HttpPost("signin")]
    [AllowAnonymous]
    public async Task<IActionResult> SignIn([FromBody] SignInRequest req, CancellationToken ct)
    {
        var result = await _auth.SignInAsync(req, ct);
        return Ok(result);
    }

    // Authenticated: sign out (invalidate server-side if possible)
    [HttpPost("signout")]
    [Authorize]
    public async Task<IActionResult> SignOut(CancellationToken ct)
    {
        // read access token from Authorization header
        var token = Request.Headers["Authorization"].FirstOrDefault()?.Replace("Bearer ", "");
        if (string.IsNullOrEmpty(token)) return BadRequest("Authorization header required.");
        await _auth.SignOutAsync(token, ct);
        return NoContent();
    }

    // Public: request password reset
    [HttpPost("password-reset")]
    [AllowAnonymous]
    public async Task<IActionResult> PasswordReset([FromBody] PasswordResetRequest req, CancellationToken ct)
    {
        await _auth.SendPasswordResetAsync(req, ct);
        return Accepted();
    }

    // Protected: get profile using access token
    [HttpGet("profile")]
    [Authorize]
    public async Task<IActionResult> Profile(CancellationToken ct)
    {
        var token = Request.Headers["Authorization"].FirstOrDefault()?.Replace("Bearer ", "");
        if (string.IsNullOrEmpty(token)) return BadRequest("Authorization header required.");
        var profile = await _auth.GetProfileAsync(token, ct);
        return Ok(profile);
    }

    // Protected: update profile
    [HttpPut("profile")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest req, CancellationToken ct)
    {
        var token = Request.Headers["Authorization"].FirstOrDefault()?.Replace("Bearer ", "");
        if (string.IsNullOrEmpty(token)) return BadRequest("Authorization header required.");
        var profile = await _auth.UpdateProfileAsync(token, req, ct);
        return Ok(profile);
    }
}