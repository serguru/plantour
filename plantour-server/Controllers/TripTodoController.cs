using Microsoft.AspNetCore.Mvc;
using plantour_server.Attributes;
using plantour_server.DTOs;
using plantour_server.Services;
using PlantourApi.Middleware;

namespace plantour_server.Controllers;

[ApiController]
[Route("[controller]")]
public class TripTodoController(ITripTodoService service) : ControllerBase
{
    private readonly ITripTodoService _service = service;

    [HttpPost("insert-from-dic")]
    [AdminOrParticipant]
    public async Task<ActionResult> AddFromDic([FromBody] MultipleIdsRequest request)
    {
        var insertedCount = await _service.InsertTripUserTodosAsync(request.CollectionId, request.Ids);
        return Ok(new { insertedCount });
    }

    [HttpPost("delete-from-dic")]
    [AdminOrParticipant]
    public async Task<ActionResult> DeleteFromDic([FromBody] MultipleIdsRequest request)
    {
        var deletedCount = await _service.DeleteTripUserTodosAsync(request.CollectionId, request.Ids);
        return Ok(new { deletedCount });
    }

    [HttpGet("trip/{tripId}")]
    [AdminOrParticipant]
    public async Task<ActionResult<IEnumerable<TripTodoDto>>> GetAll(Guid tripId)
    {
        var dtos = await _service.GetAllAsync(tripId);
        return Ok(dtos);
    }

    [HttpGet("{tripId}/{id}")]
    [AdminOrParticipant]
    public async Task<ActionResult<TripTodoDto>> GetById(Guid tripId, Guid id)
    {
        var dto = await _service.GetByIdAsync(tripId, id);
        if (dto == null)
        {
            throw new CustomException("Trip user todo not found");
        }

        return Ok(dto);
    }

    [HttpPost]
    [AdminOrParticipant]
    public async Task<ActionResult<TripTodoDto>> Add([FromBody] CreateTripTodoRequest request)
    {
        var dto = await _service.AddAsync(request);
        return Ok(dto);
    }

    [HttpPut]
    [AdminOrParticipant]
    public async Task<ActionResult> Update([FromBody] UpdateTripTodoRequest request)
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

    [HttpPut("toggle-finished-trip-todos")]
    [AdminOrParticipant]
    public async Task<ActionResult> ToggleFinishedTripTodos([FromBody] IdTripIdFinishedRequest request)
    {
        await _service.ToggleFinishedTripTodosAsync(request.TripId, request.Id, request.Finished);
        return Ok();
    }
}