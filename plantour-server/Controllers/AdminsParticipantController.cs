using Microsoft.AspNetCore.Mvc;
using plantour_server.DTOs;
using plantour_server.Services;
using plantour_server.Attributes;
using Microsoft.AspNetCore.Authorization;

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
    [AdminOnly]
    public async Task<ActionResult<IEnumerable<AdminsParticipantDto>>> GetAll()
    {
        try
        {
            var dtos = await _service.GetAllAsync();
            return Ok(dtos);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving admins participants", details = ex.Message });
        }
    }

    [HttpGet("{id}")]
    [AdminOnly]
    public async Task<ActionResult<AdminsParticipantDto>> GetById(Guid id)
    {
        try
        {
            var dto = await _service.GetByIdAsync(id);
            if (dto == null)
            {
                return NotFound(new { message = "Admins participant not found" });
            }

            return Ok(dto);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving the admins participant", details = ex.Message });
        }
    }

    [HttpGet("email/{email}")]
    [AdminOnly]
    public async Task<ActionResult<AdminsParticipantDto>> GetByEmail(string email)
    {
        try
        {
            var dto = await _service.GetByEmailAsync(email);
            if (dto == null)
            {
                return NotFound(new { message = "Admins participant not found" });
            }

            return Ok(dto);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving the admins participant", details = ex.Message });
        }
    }

    [HttpPost]
    [AdminOnly]
    public async Task<ActionResult<AdminsParticipantDto>> Add([FromBody] CreateAdminsParticipantRequest request)
    {
        try
        {
            var dto = await _service.AddAsync(request);
            return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while creating the admins participant", details = ex.Message });
        }
    }

    [HttpPut]
    [AdminOnly]
    public async Task<ActionResult> Update([FromBody] UpdateAdminsParticipantRequest request)
    {
        try
        {
            var updated = await _service.UpdateAsync(request);
            if (!updated)
            {
                return NotFound(new { message = "Admins participant not found" });
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while updating the admins participant", details = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [AdminOnly]
    public async Task<ActionResult> Delete(Guid id)
    {
        try
        {
            var deleted = await _service.DeleteAsync(id);
            if (!deleted)
            {
                return NotFound(new { message = "Admins participant not found" });
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while deleting the admins participant", details = ex.Message });
        }
    }
}
