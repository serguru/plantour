using Microsoft.AspNetCore.Mvc;
using plantour_server.Attributes;
using plantour_server.DTOs;
using plantour_server.Services;

namespace plantour_server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TripThingController : ControllerBase
{
    private readonly ITripUserThingService _service;

    public TripThingController(ITripUserThingService service)
    {
        _service = service;
    }

    [HttpPost("insert-from-dic")]
    [AdminOrParticipant]
    public async Task<ActionResult<TripUserPackageDto>> AddFromDic([FromBody] MultipleIdsRequest request)
    {
        try
        {
            var insertedCount = await _service.InsertTripUserThingsAsync(request.CollectionId, request.Ids);
            return Ok(new {insertedCount});
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while creating the trip user thing(s)", details = ex.Message });
        }
    }

    [HttpPost("delete-from-dic")]
    [AdminOrParticipant]
    public async Task<ActionResult<TripUserPackageDto>> DeleteFromDic([FromBody] MultipleIdsRequest request)
    {
        try
        {
            var deletedCount = await _service.DeleteTripUserThingsAsync(request.CollectionId, request.Ids);
            return Ok(new {deletedCount});
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while deleting the trip user thing(s)", details = ex.Message });
        }
    }

    [HttpGet("trip/{tripId}")]
    [AdminOrParticipant]
    public async Task<ActionResult<IEnumerable<TripThingDto>>> GetAll(Guid tripId)
    {
        try
        {
            var dtos = await _service.GetAllAsync(tripId);
            return Ok(dtos);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving trip user things", details = ex.Message });
        }
    }

    [HttpGet("{id}")]
    [AdminOrParticipant]
    public async Task<ActionResult<TripThingDto>> GetById(Guid id)
    {
        try
        {
            var dto = await _service.GetByIdAsync(id);
            if (dto == null)
            {
                return NotFound(new { message = "Trip user thing not found" });
            }

            return Ok(dto);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving the trip user thing", details = ex.Message });
        }
    }

    [HttpPost]
    [AdminOrParticipant]
    public async Task<ActionResult<TripThingDto>> Add([FromBody] CreateTripUserThingRequest request)
    {
        try
        {
            var dto = await _service.AddAsync(request);
            return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while creating the trip user thing", details = ex.Message });
        }
    }

    [HttpPut]
    [AdminOrParticipant]
    public async Task<ActionResult> Update([FromBody] UpdateTripUserThingRequest request)
    {
        try
        {
            var updated = await _service.UpdateAsync(request);
            if (!updated)
            {
                return NotFound(new { message = "Trip user thing not found" });
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while updating the trip user thing", details = ex.Message });
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
                return NotFound(new { message = "Trip user thing not found" });
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while deleting the trip user thing", details = ex.Message });
        }
    }

    [HttpPut("pack-trip-things")]
    [AdminOrParticipant]
    public async Task<ActionResult> PackTripThings([FromBody] MultipleIdsRequest request)
    {

        if (request.Id == null)
        {
            return BadRequest(new { message = "PackageId (Id) must be provided" });
        }
        try
        {
            var updated = await _service.PackTripThingsAsync(request.CollectionId, request.Id!.Value, request.Ids);
            return Ok(new { updatedCount = updated });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while packing the trip user thing(-s)", details = ex.Message });
        }
    }

    [HttpPut("unpack-trip-things")]
    [AdminOrParticipant]
    public async Task<ActionResult> UnpackTripThings([FromBody] MultipleIdsRequest request)
    {

        if (request.Id == null)
        {
            return BadRequest(new { message = "PackageId (Id) must be provided" });
        }
        try
        {
            var updated = await _service.UnpackTripThingsAsync(request.CollectionId, request.Id!.Value, request.Ids);
            return Ok(new { updatedCount = updated });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while unpacking the trip user thing(-s)", details = ex.Message });
        }
    }

}
