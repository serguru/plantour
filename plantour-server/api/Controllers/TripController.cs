using Microsoft.AspNetCore.Mvc;
using Plantour.Services;

namespace Plantour.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TripController : ControllerBase
{
    private readonly ITripService _tripService;

    public TripController(ITripService tripService)
    {
        _tripService = tripService;
    }

    [HttpGet("{tripId:guid}")]
    public async Task<IActionResult> GetTrip(Guid tripId)
    {
        var result = await _tripService.GetTrip(tripId);

        if (result == null)
            return NotFound();

        return Ok(result);
    }
}
