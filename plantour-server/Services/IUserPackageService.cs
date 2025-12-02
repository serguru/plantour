using plantour_server.DTOs;

namespace plantour_server.Services;

public interface IUserPackageService
{
    Task<IEnumerable<UserPackageDto>> GetAllAsync();
    Task<UserPackageDto?> GetByIdAsync(Guid id);
    Task<UserPackageDto> AddAsync(CreateUserPackageRequest request);
    Task<bool> UpdateAsync(UpdateUserPackageRequest request);
    Task<bool> DeleteAsync(Guid id);
    Task<IEnumerable<PackageCategoryDto>> GetAllPackageCategoriesAsync();
}
