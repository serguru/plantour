using Microsoft.AspNetCore.Mvc;
using plantour_server.Attributes;
using plantour_server.DTOs;
using plantour_server.Services;
using PlantourApi.Middleware;

namespace plantour_server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TripSharedController(ITripSharedService service) : ControllerBase
{
    private readonly ITripSharedService _service = service;


    [HttpPost("insert-from-dic")]
    [AdminOrParticipant]
    public async Task<ActionResult> AddFromDic([FromBody] MultipleIdsRequest request)
    {
        var insertedCount = await _service.InsertTripSharedsAsync(request.CollectionId, request.Ids);
        return Ok(new { insertedCount });
    }

    [HttpPost("delete-from-dic")]
    [AdminOrParticipant]
    public async Task<ActionResult> DeleteFromDic([FromBody] MultipleIdsRequest request)
    {
        var deletedCount = await _service.DeleteTripSharedsAsync(request.CollectionId, request.Ids);
        return Ok(new { deletedCount });
    }

    [HttpPost("insert-from-template")]
    [AdminOrParticipant]
    public async Task<ActionResult> AddFromTemplate([FromBody] MultipleIdsRequest request)
    {
        var insertedCount = await _service.InsertTemplateTripSharedThingsAsync(request.CollectionId, request.Ids);
        return Ok(new { insertedCount });
    }

    [HttpPost("delete-from-template")]
    [AdminOrParticipant]
    public async Task<ActionResult> DeleteFromTemplate([FromBody] MultipleIdsRequest request)
    {
        var deletedCount = await _service.DeleteTemplateTripSharedThingsAsync(request.CollectionId, request.Ids);
        return Ok(new { deletedCount });
    }


    [HttpGet("trip/{tripId}")]
    [AdminOrParticipant]
    public async Task<ActionResult<IEnumerable<TripSharedDto>>> GetAll(Guid tripId)
    {
        var dtos = await _service.GetAllFullAsync(tripId);
        return Ok(dtos);
    }

    [HttpGet("{tripId}/{id}")]
    [AdminOrParticipant]
    public async Task<ActionResult<TripSharedDto>> GetById(Guid tripId, Guid id)
    {
        var dto = await _service.GetByIdAsync(tripId, id) ?? throw new CustomException("Trip shared thing not found");
        return Ok(dto);
    }

    [HttpPost]
    [AdminOrParticipant]
    public async Task<ActionResult<TripSharedDto>> Add([FromBody] CreateTripSharedRequest request)
    {
        var dto = await _service.AddAsync(request);
        return Ok(dto);
    }

    [HttpPut]
    [AdminOrParticipant]
    public async Task<ActionResult> Update([FromBody] UpdateTripSharedRequest request)
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

}
