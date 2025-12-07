using Microsoft.AspNetCore.Mvc;
using plantour_server.Attributes;
using plantour_server.DTOs;
using plantour_server.Services;

namespace plantour_server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TripUserController : ControllerBase
{
    private readonly ITripUserService _service;

    public TripUserController(ITripUserService service)
    {
        _service = service;
    }

    [HttpGet("trip/{tripId}")]
    [AdminOnly]
    public async Task<ActionResult<IEnumerable<TripUserDto>>> GetAll(Guid tripId)
    {
        try
        {
            var dtos = await _service.GetAllAsync(tripId);
            return Ok(dtos);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving trip users", details = ex.Message });
        }
    }

    [HttpGet("{id}")]
    [AdminOnly]
    public async Task<ActionResult<TripUserDto>> GetById(Guid id)
    {
        try
        {
            var dto = await _service.GetByIdAsync(id);
            if (dto == null)
            {
                return NotFound(new { message = "Trip user not found" });
            }

            return Ok(dto);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving the trip user", details = ex.Message });
        }
    }

    [HttpPost]
    [AdminOnly]
    public async Task<ActionResult<TripUserDto>> Add([FromBody] CreateTripUserRequest request)
    {
        try
        {
            var dto = await _service.AddAsync(request);
            return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while creating the trip user", details = ex.Message });
        }
    }

    [HttpPut]
    [AdminOnly]
    public async Task<ActionResult> Update([FromBody] UpdateTripUserRequest request)
    {
        try
        {
            var updated = await _service.UpdateAsync(request);
            if (!updated)
            {
                return NotFound(new { message = "Trip user not found" });
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while updating the trip user", details = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [AdminOnly]
    public async Task<ActionResult> Delete(Guid id)
    {
        try
        {
            var deleted = await _service.DeleteAsync(id);
            if (!deleted)
            {
                return NotFound(new { message = "Trip user not found" });
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while deleting the trip user", details = ex.Message });
        }
    }
}
