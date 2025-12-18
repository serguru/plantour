using Microsoft.AspNetCore.Mvc;
using plantour_server.DTOs;
using plantour_server.Services;
using plantour_server.Attributes;
using Microsoft.AspNetCore.Authorization;

namespace plantour_server.Controllers;

[ApiController]
[Route("api/[controller]")]
[AdminOnly]
public class AdminsParticipantController : ControllerBase
{
    private readonly IAdminsParticipantService _service;

    public AdminsParticipantController(IAdminsParticipantService service)
    {
        _service = service;
    }

    [HttpGet]
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

    [HttpPut]
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
