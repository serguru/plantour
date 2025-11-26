using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Plantour.Infrastructure.Dtos;
using Plantour.Services;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Plantour.Auth.Controllers;

[ApiController]
[Route("api/profile")]
public class ProfileController : ControllerBase
{
    private readonly ISupabaseAuthService _authService;

    public ProfileController(ISupabaseAuthService auth, ICommunicationService communication)
    {
        _authService = auth;
    }

    // Get info from validated JWT
    [HttpGet("me")]
    [Authorize] // only valid tokens accepted
    public async Task<IActionResult> GetMe()
    {
        var user_metadata = User.FindFirst("user_metadata")?.Value;
        return Ok(user_metadata);
    }

    // Example: update profile through server-side Supabase client.
    // Note: this operation requires your server to have an active session for that user,
    // which is unusual for typical API flows (clients usually update their profile using the Supabase client directly).
    [HttpPost("update")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest dto)
    {
        // Usually you would accept a token from the client and call Supabase directly from client.
        // If you want server to proxy: you must re-authenticate as the user (or act with elevated privileged account):
        // For demo we call the DI Supabase service which keeps a session (if you logged it in)
        await _authService.UpdateProfileAsync(dto.NewMetadata);
        return Ok(new { message = "profile_update_requested" });
    }
}
