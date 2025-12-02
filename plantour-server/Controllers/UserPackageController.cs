using Microsoft.AspNetCore.Mvc;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Repositories;

namespace plantour_server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserPackageController : ControllerBase
{
    private readonly UserPackageRepository _repository;

    public UserPackageController(UserPackageRepository repository)
    {
        _repository = repository;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserPackageDto>>> GetAll()
    {
        try
        {
            var userPackages = await _repository.GetAllAsync();
            var dtos = userPackages.Select(up => new UserPackageDto
            {
                Id = up.Id,
                UserId = up.UserId,
                CategoryId = up.CategoryId,
                ShortDescription = up.ShortDescription,
                Description = up.Description
            });
            return Ok(dtos);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving user packages", details = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserPackageDto>> GetById(Guid id)
    {
        try
        {
            var userPackage = await _repository.GetByIdAsync(id);
            if (userPackage == null)
            {
                return NotFound(new { message = "User package not found" });
            }

            var dto = new UserPackageDto
            {
                Id = userPackage.Id,
                UserId = userPackage.UserId,
                CategoryId = userPackage.CategoryId,
                ShortDescription = userPackage.ShortDescription,
                Description = userPackage.Description
            };

            return Ok(dto);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving the user package", details = ex.Message });
        }
    }

    [HttpPost]
    public async Task<ActionResult<UserPackageDto>> Add([FromBody] CreateUserPackageRequest request)
    {
        try
        {
            var userPackage = new UserPackage
            {
                Id = Guid.NewGuid(),
                UserId = request.UserId,
                CategoryId = request.CategoryId,
                ShortDescription = request.ShortDescription,
                Description = request.Description
            };

            var created = await _repository.AddAsync(userPackage);

            var dto = new UserPackageDto
            {
                Id = created.Id,
                UserId = created.UserId,
                CategoryId = created.CategoryId,
                ShortDescription = created.ShortDescription,
                Description = created.Description
            };

            return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while creating the user package", details = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(Guid id, [FromBody] UpdateUserPackageRequest request)
    {
        try
        {
            var userPackage = await _repository.GetByIdAsync(id);
            if (userPackage == null)
            {
                return NotFound(new { message = "User package not found" });
            }

            if (request.CategoryId.HasValue)
            {
                userPackage.CategoryId = request.CategoryId;
            }

            if (!string.IsNullOrEmpty(request.ShortDescription))
            {
                userPackage.ShortDescription = request.ShortDescription;
            }

            if (request.Description != null)
            {
                userPackage.Description = request.Description;
            }

            await _repository.UpdateAsync(userPackage);

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while updating the user package", details = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        try
        {
            var exists = await _repository.ExistsAsync(id);
            if (!exists)
            {
                return NotFound(new { message = "User package not found" });
            }

            await _repository.DeleteAsync(id);

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while deleting the user package", details = ex.Message });
        }
    }
}
