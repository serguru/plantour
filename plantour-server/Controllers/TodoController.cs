using Microsoft.AspNetCore.Mvc;
using plantour_server.Attributes;
using plantour_server.DTOs;
using plantour_server.Services;

namespace plantour_server.Controllers;

[ApiController]
[Route("[controller]")]
public class TodoController(ITodoService service) : ControllerBase
{
    private readonly ITodoService _service = service;

    [HttpGet]
    [AdminOrParticipant]
    public async Task<ActionResult<IEnumerable<TodoDto>>> GetAll()
    {
        var dtos = await _service.GetAllAsync();
        return Ok(dtos);
    }

    [HttpGet("trip/{tripId}")]
    [AdminOrParticipant]
    public async Task<ActionResult<IEnumerable<TodoDto>>> GetAllForTrip(Guid tripId)
    {
        var dtos = await _service.GetAllForTripAsync(tripId);
        return Ok(dtos);
    }

    [HttpGet("trip-shared/{tripId}")]
    [AdminOnly]
    public async Task<ActionResult<IEnumerable<TodoDto>>> GetAllForTripShared(Guid tripId)
    {
        var dtos = await _service.GetAllForTripSharedAsync(tripId);
        return Ok(dtos);
    }

    [HttpGet("{id}")]
    [AdminOrParticipant]
    public async Task<ActionResult<TodoDto>> GetById(Guid id)
    {
        var dto = await _service.GetByIdAsync(id);
        if (dto == null)
        {
            return NotFound(new { message = "User todo not found" });
        }

        return Ok(dto);
    }

    [HttpPost]
    [AdminOrParticipant]
    public async Task<ActionResult<TodoDto>> Add([FromBody] CreateTodoRequest request)
    {
        var dto = await _service.AddAsync(request);
        return Ok(dto);
    }

    [HttpPut]
    [AdminOrParticipant]
    public async Task<ActionResult> Update([FromBody] UpdateTodoRequest request)
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
    public async Task<ActionResult<IEnumerable<TodoCategoryDto>>> GetAllCategories()
    {
        var dtos = await _service.GetAllTodoCategoriesAsync();
        return Ok(dtos);
    }
}