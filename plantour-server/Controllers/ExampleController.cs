using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using PlantourApi.Authorization;
using PlantourApi.Extensions;
using PlantourApi.DTOs;

namespace PlantourApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TripsController : ControllerBase
{
    // Admin only - can create trips
    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public IActionResult CreateTrip([FromBody] TripDto tripDto)
    {
        var currentUser = HttpContext.GetCurrentUser();
        // Only admins can reach here
        return Ok(new { Message = "Trip created by admin", User = currentUser });
    }

    // Participant only
    [HttpGet("my-invitations")]
    [Authorize(Policy = "ParticipantOnly")]
    public IActionResult GetMyInvitations()
    {
        var currentUser = HttpContext.GetCurrentUser();
        // Only participants can reach here
        return Ok(new { Message = "Participant invitations", User = currentUser });
    }

    // Admin and Participant - can view trips
    [HttpGet("{id}")]
    [Authorize(Policy = "AdminAndParticipant")]
    public IActionResult GetTrip(Guid id)
    {
        var currentUser = HttpContext.GetCurrentUser();
        // Both admins and participants can reach here
        return Ok(new { TripId = id, User = currentUser });
    }

    // Public access - no authentication required
    [HttpGet("public/featured")]
    [AllowAnonymous]
    public IActionResult GetFeaturedTrips()
    {
        var currentUser = HttpContext.GetCurrentUser();
        // Anyone can access, including unauthenticated users
        return Ok(new { Message = "Public featured trips", Role = currentUser.Role });
    }
}