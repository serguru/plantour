using Microsoft.AspNetCore.Mvc;
using plantour_server.Attributes;
using plantour_server.DTOs;
using plantour_server.Services;
using PlantourApi.Middleware;

namespace plantour_server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TripThingController(ITripThingService service) : ControllerBase
{
    private readonly ITripThingService _service = service;

    [HttpPost("insert-from-dic")]
    [AdminOrParticipant]
    public async Task<ActionResult> AddFromDic([FromBody] MultipleIdsRequest request)
    {
        var insertedCount = await _service.InsertTripUserThingsAsync(request.CollectionId, request.Ids);
        return Ok(new { insertedCount });
    }

    [HttpPost("delete-from-dic")]
    [AdminOrParticipant]
    public async Task<ActionResult> DeleteFromDic([FromBody] MultipleIdsRequest request)
    {
        var deletedCount = await _service.DeleteTripUserThingsAsync(request.CollectionId, request.Ids);
        return Ok(new { deletedCount });
    }

    [HttpPost("insert-from-template")]
    [AdminOrParticipant]
    public async Task<ActionResult> AddFromTemplate([FromBody] MultipleIdsRequest request)
    {
        var insertedCount = await _service.InsertTemplateTripUserThingsAsync(request.CollectionId, request.Ids);
        return Ok(new { insertedCount });
    }
    [HttpPost("insert-from-template-ai")]
    [AdminOrParticipant]
    public async Task<ActionResult> AddFromTemplateAi([FromBody] MultipleIdsRequest request)
    {
        var insertedCount = await _service.InsertTemplateAiTripUserThingsAsync(request.CollectionId, request.Ids);
        return Ok(new { insertedCount });
    }

    [HttpPost("delete-from-template")]
    [AdminOrParticipant]
    public async Task<ActionResult> DeleteFromTemplate([FromBody] MultipleIdsRequest request)
    {
        var deletedCount = await _service.DeleteTemplateTripUserThingsAsync(request.CollectionId, request.Ids);
        return Ok(new { deletedCount });
    }
    [HttpPost("delete-from-template-ai")]
    [AdminOrParticipant]
    public async Task<ActionResult> DeleteFromTemplateAi([FromBody] MultipleIdsRequest request)
    {
        var deletedCount = await _service.DeleteTemplateAiTripUserThingsAsync(request.CollectionId, request.Ids);
        return Ok(new { deletedCount });
    }

    [HttpPost("insert-from-ai-template")]
    [AdminOrParticipant]
    public async Task<ActionResult<int>> AddFromAiTemplate([FromBody] AddAiThingsRequest request)
    {
        var insertedCount = await _service.InsertFromAiTemplateAsync(request.TripId, request.Things);
        return Ok(insertedCount);
    }


    [HttpGet("trip/{tripId}")]
    [AdminOrParticipant]
    public async Task<ActionResult<IEnumerable<TripThingDto>>> GetAll(Guid tripId)
    {
        var dtos = await _service.GetAllAsync(tripId);
        return Ok(dtos);
    }

    [HttpGet("trip/{tripId}/package/{packageId}")]
    [AdminOrParticipant]
    public async Task<ActionResult<IEnumerable<TripThingDto>>> getAllForPackage(Guid tripId, Guid packageId)
    {
        var dtos = await _service.GetAllForPackageAsync(tripId, packageId);
        return Ok(dtos);
    }

    [HttpGet("{tripId}/{id}")]
    [AdminOrParticipant]
    public async Task<ActionResult<TripThingDto>> GetById(Guid tripId, Guid id)
    {
        var dto = await _service.GetByIdAsync(tripId, id);
        if (dto == null)
        {
            throw new CustomException("Trip user item not found");
        }

        return Ok(dto);
    }

    [HttpPost]
    [AdminOrParticipant]
    public async Task<ActionResult<TripThingDto>> Add([FromBody] CreateTripThingRequest request)
    {
        var dto = await _service.AddAsync(request);
        return Ok(dto);
    }

    [HttpPut]
    [AdminOrParticipant]
    public async Task<ActionResult> Update([FromBody] UpdateTripThingRequest request)
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

    [HttpPut("pack-trip-things")]
    [AdminOrParticipant]
    public async Task<ActionResult> PackTripThings([FromBody] MultipleIdsRequest request)
    {
        var updated = await _service.PackTripThingsAsync(request.CollectionId, request.Id!.Value, request.Ids);
        return Ok(new { updatedCount = updated });
    }

    [HttpPut("unpack-trip-things")]
    [AdminOrParticipant]
    public async Task<ActionResult> UnpackTripThings([FromBody] MultipleIdsRequest request)
    {
        var updated = await _service.UnpackTripThingsAsync(request.CollectionId, request.Ids);
        return Ok(new { updatedCount = updated });
    }

    [HttpPut("toggle-finished-trip-things")]
    [AdminOrParticipant]
    public async Task<ActionResult> ToggleFinishedTripThings([FromBody] IdTripIdFinishedRequest request)
    {
        await _service.ToggleFinishedTripThingsAsync(request.TripId, request.Id, request.Finished);
        return Ok();
    }
}
