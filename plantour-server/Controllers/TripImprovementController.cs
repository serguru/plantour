using Microsoft.AspNetCore.Mvc;
using plantour_server.Attributes;
using plantour_server.DTOs;
using plantour_server.Services;
using PlantourApi.Middleware;

namespace plantour_server.Controllers;

[ApiController]
[Route("[controller]")]
public class TripImprovementController(ITripImprovementService service) : ControllerBase
{
    private readonly ITripImprovementService _service = service;

    [HttpGet("trip/{tripId}")]
    [AdminOrParticipant]
    public async Task<ActionResult<IEnumerable<TripImprovementDto>>> GetAll(Guid tripId)
    {
        var dtos = await _service.GetAllAsync(tripId);
        return Ok(dtos);
    }

    [HttpGet("{tripId}/{id}")]
    [AdminOrParticipant]
    public async Task<ActionResult<TripImprovementDto>> GetById(Guid tripId, Guid id)
    {
        var dto = await _service.GetByIdAsync(tripId, id);
        if (dto == null)
        {
            throw new CustomException("Trip improvement not found");
        }

        return Ok(dto);
    }

    [HttpPost]
    [AdminOrParticipant]
    public async Task<ActionResult<TripImprovementDto>> Add([FromBody] CreateTripImprovementRequest request)
    {
        var dto = await _service.AddAsync(request);
        return Ok(dto);
    }

    [HttpPut]
    [AdminOrParticipant]
    public async Task<ActionResult> Update([FromBody] UpdateTripImprovementRequest request)
    {
        await _service.UpdateAsync(request);
        return NoContent();
    }

    [HttpDelete("{tripId}/{id}")]
    [AdminOrParticipant]
    public async Task<ActionResult> Delete(Guid tripId, Guid id)
    {
        await _service.DeleteAsync(tripId, id);
        return NoContent();
    }

    [HttpPut("toggle-finished-trip-improvements")]
    [AdminOrParticipant]
    public async Task<ActionResult> ToggleFinished([FromBody] IdTripIdFinishedRequest request)
    {
        await _service.ToggleFinishedAsync(request.TripId, request.Id, request.Finished);
        return Ok();
    }
}