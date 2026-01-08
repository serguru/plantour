using Microsoft.AspNetCore.Mvc;
using plantour_server.Attributes;
using plantour_server.DTOs;
using plantour_server.Services;

namespace plantour_server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PackageController : ControllerBase
{
    private readonly IPackageService _service;

    public PackageController(IPackageService service)
    {
        _service = service;
    }

    [HttpGet]
    [AdminOrParticipant]
    public async Task<ActionResult<IEnumerable<PackDto>>> GetAll()
    {
        var dtos = await _service.GetAllAsync();
        return Ok(dtos);
    }

    [HttpGet("trip/{tripId}")]
    [AdminOrParticipant]
    public async Task<ActionResult<IEnumerable<PackDto>>> GetAllForTrip(Guid tripId)
    {
        var dtos = await _service.GetAllForTripAsync(tripId);
        return Ok(dtos);
    }

    [HttpGet("{id}")]
    [AdminOrParticipant]
    public async Task<ActionResult<PackDto>> GetById(Guid id)
    {
        var dto = await _service.GetByIdAsync(id);
        if (dto == null)
        {
            return NotFound(new { message = "User package not found" });
        }

        return Ok(dto);
    }

    [HttpPost]
    [AdminOrParticipant]
    public async Task<ActionResult<PackDto>> Add([FromBody] CreatePackageRequest request)
    {
        var dto = await _service.AddAsync(request);
        return Ok(dto);
    }

    [HttpPut]
    [AdminOrParticipant]
    public async Task<ActionResult> Update([FromBody] UpdatePackageRequest request)
    {
        await _service.UpdateAsync(request);
        return NoContent();
    }

    [HttpDelete("{id}")]
    [AdminOrParticipant]
    public async Task<ActionResult> Delete(Guid id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }

}
