using Microsoft.AspNetCore.Mvc;
using plantour_server.Attributes;
using plantour_server.DTOs;
using plantour_server.Services;
using PlantourApi.Middleware;

namespace plantour_server.Controllers;

[ApiController]
[Route("[controller]")]
public class TripActivityController(ITripActivityService service) : ControllerBase
{
    private readonly ITripActivityService _service = service;

    [HttpGet("trip/{tripId}/public")]
    [AdminOrParticipant]
    public async Task<ActionResult<IEnumerable<TripActivityDto>>> GetAllPublic(Guid tripId)
    {
        var dtos = await _service.GetAllPublicAsync(tripId);
        return Ok(dtos);
    }

    [HttpGet("trip/{tripId}/personal")]
    [AdminOrParticipant]
    public async Task<ActionResult<IEnumerable<TripActivityDto>>> GetAllPersonal(Guid tripId)
    {
        var dtos = await _service.GetAllPersonalAsync(tripId);
        return Ok(dtos);
    }

    [HttpGet("trip/{tripId}/public/{id}")]
    [AdminOrParticipant]
    public async Task<ActionResult<TripActivityDto>> GetPublicById(Guid tripId, Guid id)
    {
        var dto = await _service.GetPublicByIdAsync(tripId, id);
        if (dto == null)
        {
            throw new CustomException("Trip public activity not found");
        }

        return Ok(dto);
    }

    [HttpGet("trip/{tripId}/personal/{id}")]
    [AdminOrParticipant]
    public async Task<ActionResult<TripActivityDto>> GetPersonalById(Guid tripId, Guid id)
    {
        var dto = await _service.GetPersonalByIdAsync(tripId, id);
        if (dto == null)
        {
            throw new CustomException("Trip personal activity not found");
        }

        return Ok(dto);
    }

    [HttpPost("public")]
    [AdminOnly]
    public async Task<ActionResult<TripActivityDto>> AddPublic([FromBody] CreateTripActivityRequest request)
    {
        var dto = await _service.AddPublicAsync(request);
        return Ok(dto);
    }

    [HttpPost("personal")]
    [AdminOrParticipant]
    public async Task<ActionResult<TripActivityDto>> AddPersonal([FromBody] CreateTripActivityRequest request)
    {
        var dto = await _service.AddPersonalAsync(request);
        return Ok(dto);
    }

    [HttpPut("public")]
    [AdminOnly]
    public async Task<ActionResult> UpdatePublic([FromBody] UpdateTripActivityRequest request)
    {
        await _service.UpdatePublicAsync(request);
        return NoContent();
    }

    [HttpPut("personal")]
    [AdminOrParticipant]
    public async Task<ActionResult> UpdatePersonal([FromBody] UpdateTripActivityRequest request)
    {
        await _service.UpdatePersonalAsync(request);
        return NoContent();
    }

    [HttpDelete("public/{id}")]
    [AdminOnly]
    public async Task<ActionResult> DeletePublic(Guid id)
    {
        await _service.DeletePublicAsync(id);
        return NoContent();
    }

    [HttpDelete("personal/{id}")]
    [AdminOrParticipant]
    public async Task<ActionResult> DeletePersonal(Guid id)
    {
        await _service.DeletePersonalAsync(id);
        return NoContent();
    }
}