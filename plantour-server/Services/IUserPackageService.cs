using plantour_server.DTOs;

namespace plantour_server.Services;

public interface IUserPackageService
{
    Task<IEnumerable<UserPackageDto>> GetAllAsync();
    Task<UserPackageDto?> GetByIdAsync(Guid id);
    Task<UserPackageDto> AddAsync(CreatePackageRequest request);
    Task<bool> UpdateAsync(UpdatePackageRequest request);
    Task<bool> DeleteAsync(Guid id);
}
