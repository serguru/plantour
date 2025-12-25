using Microsoft.AspNetCore.Mvc;
using plantour_server.Attributes;
using plantour_server.DTOs;
using plantour_server.Services;
using PlantourApi.Middleware;

namespace plantour_server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TripThingController : ControllerBase
{
    private readonly ITripThingService _service;

    public TripThingController(ITripThingService service)
    {
        _service = service;
    }

    [HttpPost("insert-from-dic")]
    [AdminOrParticipant]
    public async Task<ActionResult<TripUserPackageDto>> AddFromDic([FromBody] MultipleIdsRequest request)
    {
        var insertedCount = await _service.InsertTripUserThingsAsync(request.CollectionId, request.Ids);
        return Ok(new { insertedCount });
    }

    [HttpPost("delete-from-dic")]
    [AdminOrParticipant]
    public async Task<ActionResult<TripUserPackageDto>> DeleteFromDic([FromBody] MultipleIdsRequest request)
    {
        var deletedCount = await _service.DeleteTripUserThingsAsync(request.CollectionId, request.Ids);
        return Ok(new { deletedCount });
    }

    [HttpGet("trip/{tripId}")]
    [AdminOrParticipant]
    public async Task<ActionResult<IEnumerable<TripThingDto>>> GetAll(Guid tripId)
    {
        var dtos = await _service.GetAllAsync(tripId);
        return Ok(dtos);
    }

    [HttpGet("{tripId}/{id}")]
    [AdminOrParticipant]
    public async Task<ActionResult<TripThingDto>> GetById(Guid tripId, Guid id)
    {
        var dto = await _service.GetByIdAsync(tripId, id);
        if (dto == null)
        {
            throw new CustomException("Trip user thing not found");
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
        var updated = await _service.UnpackTripThingsAsync(request.CollectionId, request.Id!.Value, request.Ids);
        return Ok(new { updatedCount = updated });
    }

}
