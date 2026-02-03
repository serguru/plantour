using Microsoft.AspNetCore.Mvc;
using plantour_server.DTOs;
using plantour_server.Services;
using plantour_server.Attributes;
using Microsoft.AspNetCore.Authorization;

namespace plantour_server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TripController : ControllerBase
{
    private readonly ITripService _service;

    public TripController(ITripService service)
    {
        _service = service;
    }

    [HttpGet]
    [AdminOrParticipant]
    public async Task<ActionResult<IEnumerable<TripDto>>> GetAll()
    {
        var dtos = await _service.GetAllWithStatsAsync();
        return Ok(dtos);
    }

    [HttpGet("where-participant")]
    [AdminOrParticipant]
    public async Task<ActionResult<IEnumerable<TripDto>>> GetAllWhereParticipant()
    {
        var dtos = await _service.GetAllWithStatsWhereParticipantAsync();
        return Ok(dtos);
    }

    [HttpGet("{id}")]
    [AdminOrParticipant]
    public async Task<ActionResult<TripDto>> GetById(Guid id)
    {
        var dto = await _service.GetByIdWithStatsAsync(id);
        if (dto == null)
        {
            return NotFound(new { message = "Trip not found" });
        }

        return Ok(dto);
    }

    [HttpPost]
    [AdminOnly]
    public async Task<ActionResult<TripDto>> Add([FromBody] CreateTripRequest request)
    {
        var dto = await _service.AddAsync(request);
        return Ok(dto);
    }

    [HttpPut]
    [AdminOnly]
    public async Task<ActionResult> Update([FromBody] UpdateTripRequest request)
    {
        await _service.UpdateAsync(request);
        return NoContent();
    }

    [HttpDelete("{id}")]
    [AdminOnly]
    public async Task<ActionResult> Delete(Guid id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }

    [HttpGet("dashboard-trip")]
    [AdminOrParticipant]
    public async Task<ActionResult<TripDto?>> GetDashboardTrip()
    {
        var dto = await _service.GetDashboardTripWithStatsAsync();
        return Ok(dto);
    }

    // [HttpGet("dashboard-trips-all")]
    // [AdminOrParticipant]
    // public async Task<ActionResult<Object>> GetDashboardTripsAll()
    // {
    //     var dto = await _service.GetDashboardTripsAllWithStatsAsync();
    //     return Ok(dto);
    // }

}
