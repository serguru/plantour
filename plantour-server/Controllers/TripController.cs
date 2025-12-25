using Microsoft.AspNetCore.Mvc;
using plantour_server.DTOs;
using plantour_server.Services;
using plantour_server.Attributes;
using Microsoft.AspNetCore.Authorization;

namespace plantour_server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TripController : ControllerBase
{
    private readonly ITripService _service;

    public TripController(ITripService service)
    {
        _service = service;
    }

    [HttpGet]
    [AdminOrParticipant]
    public async Task<ActionResult<IEnumerable<TripDto>>> GetAll()
    {
        try
        {
            var dtos = await _service.GetAllAsync();
            return Ok(dtos);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving trips", details = ex.Message });
        }
    }

    [HttpGet("participant")]
    [AdminOrParticipant]
    public async Task<ActionResult<IEnumerable<TripDto>>> GetAllForParticipant()
    {
        try
        {
            var dtos = await _service.GetAllForParticipantAsync();
            return Ok(dtos);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving trips", details = ex.Message });
        }
    }

    [HttpGet("{id}")]
    [AdminOrParticipant]
    public async Task<ActionResult<TripDto>> GetById(Guid id)
    {
        try
        {
            var dto = await _service.GetByIdAsync(id);
            if (dto == null)
            {
                return NotFound(new { message = "Trip not found" });
            }

            return Ok(dto);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving the trip", details = ex.Message });
        }
    }

    [HttpPost]
    [AdminOnly]
    public async Task<ActionResult<TripDto>> Add([FromBody] CreateTripRequest request)
    {
        try
        {
            var dto = await _service.AddAsync(request);
            return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while creating the trip", details = ex.Message });
        }
    }

    [HttpPut]
    //[AdminOnly]
    [AllowAnonymous]
    public async Task<ActionResult> Update([FromBody] UpdateTripRequest request)
    {
        try
        {
            await _service.UpdateAsync(request);
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while updating the trip", details = ex.Message });
        }
    }

    [HttpDelete("{tripId}/{id}")]
    [AdminOnly]
    public async Task<ActionResult> Delete(Guid tripId, Guid id)
    {
        try
        {
            await _service.DeleteAsync(tripId, id);
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while deleting the trip", details = ex.Message });
        }
    }

    [HttpGet("stat/{id}")]
    [AdminOrParticipant]
    public async Task<ActionResult<TripStatDto?>> GetTripStats(Guid id)
    {
        try
        {
            var dtos = await _service.GetTripStatsAsync(id);
            return Ok(dtos);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving trip stats", details = ex.Message });
        }
    }

}
