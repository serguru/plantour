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
    public async Task<ActionResult<TripUserPackageDto>> AddFromDic([FromBody] MultipleIdsRequest request)
    {
        try
        {
            var insertedCount = await _service.InsertTripUserPackagesAsync(request.CollectionId, request.Ids);
            return Ok(new {insertedCount});
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while creating the trip user package(s)", details = ex.Message });
        }
    }

    [HttpPost("delete-from-dic")]
    [AdminOrParticipant]
    public async Task<ActionResult<TripUserPackageDto>> DeleteFromDic([FromBody] MultipleIdsRequest request)
    {
        try
        {
            var deletedCount = await _service.DeleteTripUserPackagesAsync(request.CollectionId, request.Ids);
            return Ok(new {deletedCount});
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while deleting the trip user package(s)", details = ex.Message });
        }
    }

    [HttpGet("trip/{tripId}")]
    [AdminOrParticipant]
    public async Task<ActionResult<IEnumerable<TripUserPackageDto>>> GetAll(Guid tripId)
    {
        try
        {
            var dtos = await _service.GetAllAsync(tripId);
            return Ok(dtos);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving trip user packages", details = ex.Message });
        }
    }

    [HttpGet("{tripId}/{id}")]
    [AdminOrParticipant]
    public async Task<ActionResult<TripUserPackageDto>> GetById(Guid tripId, Guid id)
    {
        try
        {
            var dto = await _service.GetByIdAsync(tripId, id);
            if (dto == null)
            {
                return NotFound(new { message = "Trip user package not found" });
            }

            return Ok(dto);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving the trip user package", details = ex.Message });
        }
    }

    [HttpPost]
    [AdminOrParticipant]
    public async Task<ActionResult<TripUserPackageDto>> Add([FromBody] CreateTripPackageRequest request)
    {
        try
        {
            var dto = await _service.AddAsync(request);
            return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while creating the trip user package", details = ex.Message });
        }
    }

    [HttpPut]
    [AdminOrParticipant]
    public async Task<ActionResult> Update([FromBody] UpdateTripPackageRequest request)
    {
        try
        {
            await _service.UpdateAsync(request);
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while updating the trip user package", details = ex.Message });
        }
    }

    [HttpDelete("{tripId}/{id}")]
    [AdminOrParticipant]
    public async Task<ActionResult> Delete(Guid tripId, Guid id)
    {
        try
        {
            await _service.DeleteAsync(tripId, id);
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while deleting the trip user package", details = ex.Message });
        }
    }
}
