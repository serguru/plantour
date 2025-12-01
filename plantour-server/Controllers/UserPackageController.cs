using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using plantour_server.DTOs;
using plantour_server.Models;
using plantour_server.Repositories;
using PlantourApi.Extensions;

namespace plantour_server.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AdminOrParticipant")]
public class UserPackageController : ControllerBase
{
    private readonly IUserPackageRepository _userPackageRepository;

    public UserPackageController(IUserPackageRepository userPackageRepository)
    {
        _userPackageRepository = userPackageRepository;
    }

    [HttpGet]
    public async Task<ActionResult<List<UserPackageResponse>>> GetAll()
    {
        try
        {
            var userPackages = await _userPackageRepository.GetAllByUserIdAsync();
            var response = userPackages.Select(MapToResponse).ToList();
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving user packages", details = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserPackageResponse>> GetById(Guid id)
    {
        try
        {
            var userPackage = await _userPackageRepository.GetByIdAsync(id);
            if (userPackage == null)
            {
                return NotFound(new { message = "User package not found" });
            }

            return Ok(MapToResponse(userPackage));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving the user package", details = ex.Message });
        }
    }

    [HttpPost]
    public async Task<ActionResult<UserPackageResponse>> Create([FromBody] CreateUserPackageRequest request)
    {
        try
        {
            var currentUser = HttpContext.GetCurrentUser();
            if (!currentUser.UserId.HasValue)
            {
                return Unauthorized(new { message = "User ID is required" });
            }
            
            var userPackage = new UserPackage
            {
                UserId = currentUser.UserId.Value,
                CategoryId = request.CategoryId,
                ParentPackageId = request.ParentPackageId,
                ShortDescription = request.ShortDescription,
                Description = request.Description,
                Brand = request.Brand,
                Model = request.Model,
                Color = request.Color,
                EmptyWeightValue = request.EmptyWeightValue,
                WeightUnitId = request.WeightUnitId,
                CapacityValue = request.CapacityValue,
                CapacityUnitId = request.CapacityUnitId,
                LengthValue = request.LengthValue,
                WidthValue = request.WidthValue,
                HeightValue = request.HeightValue,
                DimensionUnitId = request.DimensionUnitId
            };

            var createdPackage = await _userPackageRepository.CreateAsync(userPackage);
            var result = await _userPackageRepository.GetByIdAsync(createdPackage.Id);
            
            return CreatedAtAction(nameof(GetById), new { id = createdPackage.Id }, MapToResponse(result!));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while creating the user package", details = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<UserPackageResponse>> Update(Guid id, [FromBody] UpdateUserPackageRequest request)
    {
        try
        {
            var currentUser = HttpContext.GetCurrentUser();
            if (!currentUser.UserId.HasValue)
            {
                return Unauthorized(new { message = "User ID is required" });
            }
            
            var userPackage = new UserPackage
            {
                Id = id,
                UserId = currentUser.UserId.Value,
                CategoryId = request.CategoryId,
                ParentPackageId = request.ParentPackageId,
                ShortDescription = request.ShortDescription,
                Description = request.Description,
                Brand = request.Brand,
                Model = request.Model,
                Color = request.Color,
                EmptyWeightValue = request.EmptyWeightValue,
                WeightUnitId = request.WeightUnitId,
                CapacityValue = request.CapacityValue,
                CapacityUnitId = request.CapacityUnitId,
                LengthValue = request.LengthValue,
                WidthValue = request.WidthValue,
                HeightValue = request.HeightValue,
                DimensionUnitId = request.DimensionUnitId
            };

            var updatedPackage = await _userPackageRepository.UpdateAsync(userPackage);
            if (updatedPackage == null)
            {
                return NotFound(new { message = "User package not found" });
            }

            var result = await _userPackageRepository.GetByIdAsync(updatedPackage.Id);
            return Ok(MapToResponse(result!));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while updating the user package", details = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            var deleted = await _userPackageRepository.DeleteAsync(id);
            if (!deleted)
            {
                return NotFound(new { message = "User package not found" });
            }

            return Ok(new { message = "User package deleted successfully" });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while deleting the user package", details = ex.Message });
        }
    }

    private static UserPackageResponse MapToResponse(UserPackage userPackage)
    {
        return new UserPackageResponse
        {
            Id = userPackage.Id,
            UserId = userPackage.UserId,
            CategoryId = userPackage.CategoryId,
            CategoryName = userPackage.Category?.Name,
            ParentPackageId = userPackage.ParentPackageId,
            ParentPackageShortDescription = userPackage.ParentPackage?.ShortDescription,
            ShortDescription = userPackage.ShortDescription,
            Description = userPackage.Description,
            Brand = userPackage.Brand,
            Model = userPackage.Model,
            Color = userPackage.Color,
            EmptyWeightValue = userPackage.EmptyWeightValue,
            WeightUnitId = userPackage.WeightUnitId,
            WeightUnitName = userPackage.WeightUnit?.Name,
            CapacityValue = userPackage.CapacityValue,
            CapacityUnitId = userPackage.CapacityUnitId,
            CapacityUnitName = userPackage.CapacityUnit?.Name,
            LengthValue = userPackage.LengthValue,
            WidthValue = userPackage.WidthValue,
            HeightValue = userPackage.HeightValue,
            DimensionUnitId = userPackage.DimensionUnitId,
            DimensionUnitName = userPackage.DimensionUnit?.Name
        };
    }
}
