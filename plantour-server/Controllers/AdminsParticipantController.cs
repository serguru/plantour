using Microsoft.AspNetCore.Mvc;
using plantour_server.DTOs;
using plantour_server.Services;
using plantour_server.Attributes;
using Microsoft.AspNetCore.Authorization;
using plantour_server.Models;

namespace plantour_server.Controllers;

[ApiController]
[Route("api/[controller]")]

public class AdminsParticipantController : ControllerBase
{
    private readonly IAdminsParticipantService _service;

    public AdminsParticipantController(IAdminsParticipantService service)
    {
        _service = service;
    }

    [HttpGet]
    [AdminOrParticipant]
    public async Task<ActionResult<IEnumerable<AdminsParticipantDto>>> GetAll()
    {
        var dtos = await _service.GetAllAsync();
        return Ok(dtos);
    }

    [HttpGet("trip/{tripId}")]
    [AdminOrParticipant]
    public async Task<ActionResult<IEnumerable<AdminsParticipantDto>>> GetAllForTrip(Guid tripId)
    {
        var dtos = await _service.GetAllForTripAsync(tripId);
        return Ok(dtos);
    }

    [HttpGet("{id}")]
    [AdminOrParticipant]
    public async Task<ActionResult<AdminsParticipantDto>> GetById(Guid id)
    {
        var dto = await _service.GetByIdAsync(id);
        if (dto == null)
        {
            return NotFound(new { message = "Admins participant not found" });
        }

        return Ok(dto);
    }

    [HttpPut]
    [AdminOnly]
    public async Task<ActionResult> Update([FromBody] UpdateAdminsParticipantRequest request)
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

    [HttpGet("check-participant/{email}")]
    [AdminOnly]
    public async Task<ActionResult<CheckParticipantDto>> CheckParticipant(string email)
    {
        var result = await _service.CheckParticipant(email);
        return Ok(result);
    }

}
