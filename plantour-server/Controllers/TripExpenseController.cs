using Microsoft.AspNetCore.Mvc;
using plantour_server.Attributes;
using plantour_server.DTOs;
using plantour_server.Services;
using PlantourApi.Middleware;

namespace plantour_server.Controllers;

[ApiController]
[Route("[controller]")]
public class TripExpenseController(ITripExpenseService service) : ControllerBase
{
    private readonly ITripExpenseService _service = service;

    [HttpGet("trip/{tripId}")]
    [AdminOrParticipant]
    public async Task<ActionResult<IEnumerable<TripExpenseDto>>> GetAll(Guid tripId)
    {
        var dtos = await _service.GetAllAsync(tripId);
        return Ok(dtos);
    }

    [HttpGet("{tripId}/{id}")]
    [AdminOrParticipant]
    public async Task<ActionResult<TripExpenseDto>> GetById(Guid tripId, Guid id)
    {
        var dto = await _service.GetByIdAsync(tripId, id);
        if (dto == null)
        {
            throw new CustomException("Trip expense not found");
        }

        return Ok(dto);
    }

    [HttpGet("rate/{tripId}/{currencyId}")]
    [AdminOrParticipant]
    public async Task<ActionResult<decimal>> GetSuggestedRate(Guid tripId, Guid currencyId)
    {
        var rate = await _service.GetSuggestedRateAsync(tripId, currencyId);
        return Ok(rate);
    }

    [HttpPost]
    [AdminOrParticipant]
    public async Task<ActionResult<TripExpenseDto>> Add([FromBody] CreateTripExpenseRequest request)
    {
        var dto = await _service.AddAsync(request);
        return Ok(dto);
    }

    [HttpPut]
    [AdminOrParticipant]
    public async Task<ActionResult> Update([FromBody] UpdateTripExpenseRequest request)
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