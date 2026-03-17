using Microsoft.AspNetCore.Mvc;
using plantour_server.Attributes;
using plantour_server.DTOs;
using plantour_server.Services;
using PlantourApi.Middleware;

namespace plantour_server.Controllers;

[ApiController]
[Route("[controller]")]
public class TripSharedTodoController(ITripSharedTodoService service) : ControllerBase
{
    private readonly ITripSharedTodoService _service = service;

    [HttpPost("insert-from-dic")]
    [AdminOrParticipant]
    public async Task<ActionResult> AddFromDic([FromBody] MultipleIdsRequest request)
    {
        var insertedCount = await _service.InsertTripSharedTodosAsync(request.CollectionId, request.Ids);
        return Ok(new { insertedCount });
    }

    [HttpPost("delete-from-dic")]
    [AdminOrParticipant]
    public async Task<ActionResult> DeleteFromDic([FromBody] MultipleIdsRequest request)
    {
        var deletedCount = await _service.DeleteTripSharedTodosAsync(request.CollectionId, request.Ids);
        return Ok(new { deletedCount });
    }

    [HttpGet("trip/{tripId}")]
    [AdminOrParticipant]
    public async Task<ActionResult<IEnumerable<TripSharedTodoDto>>> GetAll(Guid tripId)
    {
        var dtos = await _service.GetAllFullAsync(tripId);
        return Ok(dtos);
    }

    [HttpGet("trip/{tripId}/assignee/{assigneeId}")]
    [AdminOrParticipant]
    public async Task<ActionResult<IEnumerable<TripSharedTodoDto>>> GetAllForAssignee(Guid tripId, Guid assigneeId)
    {
        var dtos = await _service.GetAllForAssigneeAsync(tripId, assigneeId);
        return Ok(dtos);
    }

    [HttpGet("{tripId}/{id}")]
    [AdminOrParticipant]
    public async Task<ActionResult<TripSharedTodoDto>> GetById(Guid tripId, Guid id)
    {
        var dto = await _service.GetByIdAsync(tripId, id) ?? throw new CustomException("Trip shared todo not found");
        return Ok(dto);
    }

    [HttpPost]
    [AdminOnly]
    public async Task<ActionResult<TripSharedTodoDto>> Add([FromBody] CreateTripSharedTodoRequest request)
    {
        var dto = await _service.AddAsync(request);
        return Ok(dto);
    }

    [HttpPut]
    [AdminOnly]
    public async Task<ActionResult> Update([FromBody] UpdateTripSharedTodoRequest request)
    {
        await _service.UpdateAsync(request);
        return NoContent();
    }

    [HttpDelete("{tripId}/{id}")]
    [AdminOnly]
    public async Task<ActionResult> Delete(Guid tripId, Guid id)
    {
        await _service.DeleteAsync(tripId, id);
        return NoContent();
    }

    [HttpPut("assign-trip-shared-todos")]
    [AdminOnly]
    public async Task<ActionResult> AssignTripSharedTodos([FromBody] MultipleIdsAssignRequest request)
    {
        var updated = await _service.AssignTripSharedTodosAsync(request);
        return Ok(new { updatedCount = updated });
    }

    [HttpPut("unassign-trip-shared-todos")]
    [AdminOnly]
    public async Task<ActionResult> UnassignTripSharedTodos([FromBody] MultipleIdsAssignRequest request)
    {
        var updated = await _service.UnassignTripSharedTodosAsync(request.CollectionId, request.Ids);
        return Ok(new { updatedCount = updated });
    }

    [HttpPut("toggle-accept-trip-shared-todos")]
    [AdminOrParticipant]
    public async Task<ActionResult> ToggleAcceptAssignmentAsync([FromBody] IdTripIdRequest request)
    {
        await _service.ToggleAcceptAssignmentAsync(request.TripId, request.Id);
        return Ok();
    }

    [HttpPut("toggle-reject-trip-shared-todos")]
    [AdminOrParticipant]
    public async Task<ActionResult> ToggleRejectAssignmentAsync([FromBody] IdTripIdRequest request)
    {
        await _service.ToggleRejectAssignmentAsync(request.TripId, request.Id);
        return Ok();
    }
}