using Microsoft.AspNetCore.Mvc;
using plantour_server.Attributes;
using plantour_server.DTOs;
using plantour_server.Services;
using PlantourApi.Middleware;

namespace plantour_server.Controllers;

[ApiController]
[Route("[controller]")]
public class TripSharedExpenseController(ITripSharedExpenseService service) : ControllerBase
{
    private readonly ITripSharedExpenseService _service = service;

    [HttpGet("trip/{tripId}")]
    [AdminOrParticipant]
    public async Task<ActionResult<IEnumerable<TripSharedExpenseDto>>> GetAll(Guid tripId)
    {
        var dtos = await _service.GetAllFullAsync(tripId);
        return Ok(dtos);
    }

    [HttpGet("trip/{tripId}/assignee/{assigneeId}")]
    [AdminOrParticipant]
    public async Task<ActionResult<IEnumerable<TripSharedExpenseDto>>> GetAllForAssignee(Guid tripId, Guid assigneeId)
    {
        var dtos = await _service.GetAllForAssigneeAsync(tripId, assigneeId);
        return Ok(dtos);
    }

    [HttpGet("{tripId}/{id}")]
    [AdminOrParticipant]
    public async Task<ActionResult<TripSharedExpenseDto>> GetById(Guid tripId, Guid id)
    {
        var dto = await _service.GetByIdAsync(tripId, id) ?? throw new CustomException("Trip shared expense not found");
        return Ok(dto);
    }

    [HttpPost]
    [AdminOnly]
    public async Task<ActionResult<TripSharedExpenseDto>> Add([FromBody] CreateTripSharedExpenseRequest request)
    {
        var dto = await _service.AddAsync(request);
        return Ok(dto);
    }

    [HttpPut]
    [AdminOnly]
    public async Task<ActionResult> Update([FromBody] UpdateTripSharedExpenseRequest request)
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

    [HttpPut("assign-trip-shared-expenses")]
    [AdminOnly]
    public async Task<ActionResult> AssignTripSharedExpenses([FromBody] MultipleIdsAssignRequest request)
    {
        var updated = await _service.AssignTripSharedExpensesAsync(request);
        return Ok(new { updatedCount = updated });
    }

    [HttpPut("unassign-trip-shared-expenses")]
    [AdminOnly]
    public async Task<ActionResult> UnassignTripSharedExpenses([FromBody] MultipleIdsAssignRequest request)
    {
        var updated = await _service.UnassignTripSharedExpensesAsync(request.CollectionId, request.Ids);
        return Ok(new { updatedCount = updated });
    }

    [HttpPut("toggle-accept-trip-shared-expenses")]
    [AdminOrParticipant]
    public async Task<ActionResult> ToggleAcceptAssignmentAsync([FromBody] IdTripIdRequest request)
    {
        await _service.ToggleAcceptAssignmentAsync(request.TripId, request.Id);
        return Ok();
    }

    [HttpPut("toggle-reject-trip-shared-expenses")]
    [AdminOrParticipant]
    public async Task<ActionResult> ToggleRejectAssignmentAsync([FromBody] IdTripIdRequest request)
    {
        await _service.ToggleRejectAssignmentAsync(request.TripId, request.Id);
        return Ok();
    }
}