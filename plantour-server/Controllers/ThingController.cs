using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using plantour_server.Attributes;
using plantour_server.DTOs;
using plantour_server.Services;

namespace plantour_server.Controllers;

[ApiController]
[Route("api/[controller]")]

public class ThingController : ControllerBase
{
    private readonly IUserThingService _service;

    public ThingController(IUserThingService service)
    {
        _service = service;
    }

    [HttpGet]
    [AdminOrParticipant]
    public async Task<ActionResult<IEnumerable<ThingDto>>> GetAll()
    {
        try
        {
            var dtos = await _service.GetAllAsync();
            return Ok(dtos);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving user things", details = ex.Message });
        }
    }

    [HttpGet("{id}")]
    [AdminOrParticipant]
    public async Task<ActionResult<ThingDto>> GetById(Guid id)
    {
        try
        {
            var dto = await _service.GetByIdAsync(id);
            if (dto == null)
            {
                return NotFound(new { message = "User thing not found" });
            }

            return Ok(dto);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving the user thing", details = ex.Message });
        }
    }

    [HttpPost]
    [AdminOrParticipant]
    public async Task<ActionResult<ThingDto>> Add([FromBody] CreateThingRequest request)
    {
        try
        {
            var dto = await _service.AddAsync(request);
            return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while creating the user thing", details = ex.Message });
        }
    }

    [HttpPut]
    [AdminOrParticipant]
    public async Task<ActionResult> Update([FromBody] UpdateThingRequest request)
    {
        try
        {
            var updated = await _service.UpdateAsync(request);
            if (!updated)
            {
                return NotFound(new { message = "User thing not found" });
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while updating the user thing", details = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [AdminOrParticipant]
    public async Task<ActionResult> Delete(Guid id)
    {
        try
        {
            var deleted = await _service.DeleteAsync(id);
            if (!deleted)
            {
                return NotFound(new { message = "User thing not found" });
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while deleting the user thing", details = ex.Message });
        }
    }

    [HttpGet("categories")]
    [AdminOrParticipant]
    public async Task<ActionResult<IEnumerable<ThingCategoryDto>>> GetAllCategories()
    {
        try
        {
            var dtos = await _service.GetAllThingCategoriesAsync();
            return Ok(dtos);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving categories", details = ex.Message });
        }
    }

}
