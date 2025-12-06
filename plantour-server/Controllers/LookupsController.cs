using Microsoft.AspNetCore.Mvc;
using plantour_server.Attributes;
using plantour_server.DTOs;
using plantour_server.Services;

namespace plantour_server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LookupsController : ControllerBase
{
    private readonly ILookupsService _service;

    public LookupsController(ILookupsService service)
    {
        _service = service;
    }

    [HttpGet]
    [AdminOrParticipant]
    public async Task<ActionResult<LookupsResponse>> GetAllLookups()
    {
        try
        {
            var lookups = await _service.GetAllLookupsAsync();
            return Ok(lookups);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving lookups", details = ex.Message });
        }
    }
}
