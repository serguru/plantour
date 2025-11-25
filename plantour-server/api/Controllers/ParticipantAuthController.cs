using Microsoft.AspNetCore.Mvc;
using Plantour.Services;
using System.ComponentModel.DataAnnotations;

namespace Plantour.Controllers;

[ApiController]
[Route("api/auth/participant")]
public class ParticipantAuthController : ControllerBase
{
    private readonly IPlantourAuthService _auth;

    public ParticipantAuthController(IPlantourAuthService auth)
    {
        _auth = auth;
    }

    public record RegisterParticipantRequest([Required] Guid AdminTravelerId, [Required] Guid TripId, string? Email, string? FirstName, string? LastName, string? Phone);

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterParticipantRequest request)
    {
        // Optional: admin token from Authorization header may be provided and embedded later during login.
        var code = await _auth.RegisterParticipantAsync(request.AdminTravelerId, request.TripId, request.Email, request.FirstName, request.LastName, request.Phone);
        return Created(string.Empty, new { access_code = code });
    }

    public record LoginRequest([Required] string AccessCode);

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        // If an admin Supabase token is present in the incoming Authorization header, pass it for embedding.
        var authHeader = HttpContext.Request.Headers["Authorization"].FirstOrDefault();
        var adminToken = authHeader?.Split(' ').Last();

        var token = await _auth.LoginWithAccessCodeAsync(request.AccessCode, adminToken);
        return Ok(new { token });
    }

    public record ResetRequest([Required] Guid TripTravelerId);

    [HttpPost("reset")]
    public async Task<IActionResult> Reset([FromBody] ResetRequest request)
    {
        var newCode = await _auth.ResetAccessCodeAsync(request.TripTravelerId);
        return Ok(new { access_code = newCode });
    }

    [HttpGet("me")]
    public IActionResult Me()
    {
        var u = _auth.CurrentUser;
        return Ok(new
        {
            isParticipant = u.IsParticipant,
            traveler = u.Traveler == null ? null : new
            {
                u.Traveler.Id,
                u.Traveler.UserId,
                u.Traveler.AdminId,
                u.Traveler.FirstName,
                u.Traveler.LastName,
                u.Traveler.Email,
                u.Traveler.Phone
            },
            tripTraveler = u.TripTraveler == null ? null : new
            {
                u.TripTraveler.Id,
                u.TripTraveler.TripId,
                u.TripTraveler.TravelerId,
                u.TripTraveler.AccessCode
            },
            adminSupabaseUser = u.AdminSupabaseUser == null ? null : new
            {
                u.AdminSupabaseUser.Id,
                u.AdminSupabaseUser.Email
            }
        });
    }
}