using Microsoft.AspNetCore.Mvc;
using plantour_server.Attributes;
using plantour_server.DTOs;
using plantour_server.Services;

namespace plantour_server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PackageController : ControllerBase
{
    private readonly IUserPackageService _service;

    public PackageController(IUserPackageService service)
    {
        _service = service;
    }

    [HttpGet]
    [AdminOrParticipant]
    public async Task<ActionResult<IEnumerable<UserPackageDto>>> GetAll()
    {
        try
        {
            var dtos = await _service.GetAllAsync();
            return Ok(dtos);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving user packages", details = ex.Message });
        }
    }

    [HttpGet("{id}")]
    [AdminOrParticipant]
    public async Task<ActionResult<UserPackageDto>> GetById(Guid id)
    {
        try
        {
            var dto = await _service.GetByIdAsync(id);
            if (dto == null)
            {
                return NotFound(new { message = "User package not found" });
            }

            return Ok(dto);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving the user package", details = ex.Message });
        }
    }

    [HttpPost]
    [AdminOrParticipant]
    public async Task<ActionResult<UserPackageDto>> Add([FromBody] CreatePackageRequest request)
    {
        try
        {
            var dto = await _service.AddAsync(request);
            return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while creating the user package", details = ex.Message });
        }
    }

    [HttpPut]
    [AdminOrParticipant]
    public async Task<ActionResult> Update([FromBody] UpdatePackageRequest request)
    {
        try
        {
            var updated = await _service.UpdateAsync(request);
            if (!updated)
            {
                return NotFound(new { message = "User package not found" });
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while updating the user package", details = ex.Message });
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
                return NotFound(new { message = "User package not found" });
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while deleting the user package", details = ex.Message });
        }
    }

}
