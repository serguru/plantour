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
        var lookups = await _service.GetAllLookupsAsync();
        return Ok(lookups);
    }
}
