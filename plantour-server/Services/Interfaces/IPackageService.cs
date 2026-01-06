using plantour_server.DTOs;

namespace plantour_server.Services;

public interface IPackageService
{
    Task<IEnumerable<PackageDto>> GetAllAsync();
    Task<IEnumerable<PackageDto>> GetAllForTripAsync(Guid tripId);
    Task<PackageDto?> GetByIdAsync(Guid id);
    Task<PackageDto> AddAsync(CreatePackageRequest request);
    Task UpdateAsync(UpdatePackageRequest request);
    Task DeleteAsync(Guid id);
}
