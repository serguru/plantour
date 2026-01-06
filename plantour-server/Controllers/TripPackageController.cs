using Microsoft.AspNetCore.Mvc;
using plantour_server.Attributes;
using plantour_server.DTOs;
using plantour_server.Services;

namespace plantour_server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TripPackageController : ControllerBase
{
    private readonly ITripPackageService _service;

    public TripPackageController(ITripPackageService service)
    {
        _service = service;
    }


    [HttpPost("insert-from-dic")]
    [AdminOrParticipant]
    public async Task<ActionResult<TripPackageDto>> AddFromDic([FromBody] MultipleIdsRequest request)
    {
        var insertedCount = await _service.InsertTripUserPackagesAsync(request.CollectionId, request.Ids);
        return Ok(new { insertedCount });
    }

    [HttpPost("delete-from-dic")]
    [AdminOrParticipant]
    public async Task<ActionResult<TripPackageDto>> DeleteFromDic([FromBody] MultipleIdsRequest request)
    {
        var deletedCount = await _service.DeleteTripUserPackagesAsync(request.CollectionId, request.Ids);
        return Ok(new { deletedCount });
    }

    [HttpGet("trip/{tripId}")]
    [AdminOrParticipant]
    public async Task<ActionResult<IEnumerable<TripPackageDto>>> GetAll(Guid tripId)
    {
        var dtos = await _service.GetAllAsync(tripId);
        return Ok(dtos);
    }

    [HttpGet("{tripId}/{id}")]
    [AdminOrParticipant]
    public async Task<ActionResult<TripPackageDto>> GetById(Guid tripId, Guid id)
    {
        var dto = await _service.GetByIdAsync(tripId, id);
        if (dto == null)
        {
            return NotFound(new { message = "Trip user package not found" });
        }

        return Ok(dto);
    }

    [HttpPost]
    [AdminOrParticipant]
    public async Task<ActionResult<TripPackageDto>> Add([FromBody] CreateTripPackageRequest request)
    {
        var dto = await _service.AddAsync(request);
        return Ok(dto);
    }

    [HttpPut]
    [AdminOrParticipant]
    public async Task<ActionResult> Update([FromBody] UpdateTripPackageRequest request)
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
