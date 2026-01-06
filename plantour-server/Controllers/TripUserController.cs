using Microsoft.AspNetCore.Mvc;
using plantour_server.Attributes;
using plantour_server.DTOs;
using plantour_server.Services;

namespace plantour_server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TripUserController : ControllerBase
{
    private readonly ITripUserService _service;

    public TripUserController(ITripUserService service)
    {
        _service = service;
    }


    [HttpPost("insert-from-dic")]
    [AdminOnly]
    public async Task<ActionResult<TripPackageDto>> AddFromDic([FromBody] MultipleIdsRequest request)
    {
        var insertedCount = await _service.InsertTripUsersAsync(request.CollectionId, request.Ids);
        return Ok(new { insertedCount });
    }

    [HttpPost("delete-from-dic")]
    [AdminOnly]
    public async Task<ActionResult<TripPackageDto>> DeleteFromDic([FromBody] MultipleIdsRequest request)
    {
        var deletedCount = await _service.DeleteTripUsersAsync(request.CollectionId, request.Ids);
        return Ok(new { deletedCount });
    }

    [HttpGet("trip/{tripId}")]
    [AdminOnly]
    public async Task<ActionResult<IEnumerable<TripUserDto>>> GetAll(Guid tripId)
    {
        var dtos = await _service.GetAllAsync(tripId);
        return Ok(dtos);
    }

    [HttpGet("{id}")]
    [AdminOnly]
    public async Task<ActionResult<TripUserDto>> GetById(Guid tripId, Guid id)
    {
        var dto = await _service.GetByIdAsync(tripId, id);
        if (dto == null)
        {
            return NotFound(new { message = "Trip user not found" });
        }

        return Ok(dto);
    }

    [HttpPost]
    [AdminOnly]
    public async Task<ActionResult<TripUserDto>> Add([FromBody] CreateTripUserRequest request)
    {
        var dto = await _service.AddAsync(request);
        return Ok(dto);
    }

    [HttpPut]
    [AdminOnly]
    public async Task<ActionResult> Update([FromBody] UpdateTripUserRequest request)
    {
        await _service.UpdateAsync(request);
        return NoContent();
    }

    [HttpDelete("{id}")]
    [AdminOnly]
    public async Task<ActionResult> Delete(Guid tripId, Guid id)
    {
        await _service.DeleteAsync(tripId, id);
        return NoContent();
    }
}
