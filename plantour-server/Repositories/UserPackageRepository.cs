using Microsoft.EntityFrameworkCore;
using plantour_server.Models;
using PlantourApi.Extensions;

namespace plantour_server.Repositories;

public class UserPackageRepository : IUserPackageRepository
{
    private readonly PlantourContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public UserPackageRepository(PlantourContext context, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<List<UserPackage>> GetAllByUserIdAsync(Guid? userId = null)
    {
        var currentUserId = userId ?? _httpContextAccessor.HttpContext?.GetCurrentUser().UserId 
            ?? throw new UnauthorizedAccessException("User ID is required");
            
        return await _context.UserPackages
            .Where(up => up.UserId == currentUserId)
            .Include(up => up.Category)
            .Include(up => up.WeightUnit)
            .Include(up => up.CapacityUnit)
            .Include(up => up.DimensionUnit)
            .Include(up => up.ParentPackage)
            .OrderBy(up => up.ShortDescription)
            .ToListAsync();
    }

    public async Task<UserPackage?> GetByIdAsync(Guid id, Guid? userId = null)
    {
        var currentUserId = userId ?? _httpContextAccessor.HttpContext?.GetCurrentUser().UserId 
            ?? throw new UnauthorizedAccessException("User ID is required");
            
        return await _context.UserPackages
            .Where(up => up.Id == id && up.UserId == currentUserId)
            .Include(up => up.Category)
            .Include(up => up.WeightUnit)
            .Include(up => up.CapacityUnit)
            .Include(up => up.DimensionUnit)
            .Include(up => up.ParentPackage)
            .Include(up => up.InverseParentPackage)
            .FirstOrDefaultAsync();
    }

    public async Task<UserPackage> CreateAsync(UserPackage userPackage)
    {
        userPackage.Id = Guid.NewGuid();
        _context.UserPackages.Add(userPackage);
        await _context.SaveChangesAsync();
        return userPackage;
    }

    public async Task<UserPackage?> UpdateAsync(UserPackage userPackage)
    {
        var existingPackage = await _context.UserPackages
            .FirstOrDefaultAsync(up => up.Id == userPackage.Id && up.UserId == userPackage.UserId);

        if (existingPackage == null)
        {
            return null;
        }

        existingPackage.CategoryId = userPackage.CategoryId;
        existingPackage.ParentPackageId = userPackage.ParentPackageId;
        existingPackage.ShortDescription = userPackage.ShortDescription;
        existingPackage.Description = userPackage.Description;
        existingPackage.Brand = userPackage.Brand;
        existingPackage.Model = userPackage.Model;
        existingPackage.Color = userPackage.Color;
        existingPackage.EmptyWeightValue = userPackage.EmptyWeightValue;
        existingPackage.WeightUnitId = userPackage.WeightUnitId;
        existingPackage.CapacityValue = userPackage.CapacityValue;
        existingPackage.CapacityUnitId = userPackage.CapacityUnitId;
        existingPackage.LengthValue = userPackage.LengthValue;
        existingPackage.WidthValue = userPackage.WidthValue;
        existingPackage.HeightValue = userPackage.HeightValue;
        existingPackage.DimensionUnitId = userPackage.DimensionUnitId;

        await _context.SaveChangesAsync();
        return existingPackage;
    }

    public async Task<bool> DeleteAsync(Guid id, Guid? userId = null)
    {
        var currentUserId = userId ?? _httpContextAccessor.HttpContext?.GetCurrentUser().UserId 
            ?? throw new UnauthorizedAccessException("User ID is required");
            
        var userPackage = await _context.UserPackages
            .FirstOrDefaultAsync(up => up.Id == id && up.UserId == currentUserId);

        if (userPackage == null)
        {
            return false;
        }

        _context.UserPackages.Remove(userPackage);
        await _context.SaveChangesAsync();
        return true;
    }
}
