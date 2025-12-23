using Microsoft.AspNetCore.Mvc;
using plantour_server.Attributes;
using plantour_server.DTOs;
using plantour_server.Services;

namespace plantour_server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TripSharedController : ControllerBase
{
    private readonly ITripSharedService _service;

    public TripSharedController(ITripSharedService service)
    {
        _service = service;
    }

    [HttpGet("trip/{tripId}")]
    [AdminOrParticipant]
    public async Task<ActionResult<IEnumerable<TripSharedDto>>> GetAll(Guid tripId)
    {
        try
        {
            var dtos = await _service.GetAllFullAsync(tripId);
            return Ok(dtos);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving trip shared things", details = ex.Message });
        }
    }

}
