using Microsoft.AspNetCore.Mvc;
using plantour.Infrastructure.Dtos;
using Plantour.Services;

namespace Plantour.Controllers;

[ApiController]
[Route("api/tours")]
public class TourController : ControllerBase
{
    private readonly ITourService _service;

    public TourController(ITourService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
        => Ok(await _service.GetAllToursAsync());

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var result = await _service.GetTourAsync(id);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPatch]
    public async Task<IActionResult> Patch([FromBody] JsonPatchRequest req)
    {
        var result = await _service.ApplyPatchAsync(req);
        if (result == null) return NotFound();
        return Ok(result);
    }

}
