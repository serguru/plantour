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
    private readonly IThingService _service;

    public ThingController(IThingService service)
    {
        _service = service;
    }

    [HttpGet]
    [AdminOrParticipant]
    public async Task<ActionResult<IEnumerable<ThingDto>>> GetAll()
    {
        var dtos = await _service.GetAllAsync();
        return Ok(dtos);
    }

    [HttpGet("{id}")]
    [AdminOrParticipant]
    public async Task<ActionResult<ThingDto>> GetById(Guid id)
    {
        var dto = await _service.GetByIdAsync(id);
        if (dto == null)
        {
            return NotFound(new { message = "User thing not found" });
        }

        return Ok(dto);
    }

    [HttpPost]
    [AdminOrParticipant]
    public async Task<ActionResult<ThingDto>> Add([FromBody] CreateThingRequest request)
    {
        var dto = await _service.AddAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
    }

    [HttpPut]
    [AdminOrParticipant]
    public async Task<ActionResult> Update([FromBody] UpdateThingRequest request)
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

    [HttpGet("categories")]
    [AdminOrParticipant]
    public async Task<ActionResult<IEnumerable<ThingCategoryDto>>> GetAllCategories()
    {
        var dtos = await _service.GetAllThingCategoriesAsync();
        return Ok(dtos);
    }

}
