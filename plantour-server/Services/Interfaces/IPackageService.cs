using plantour_server.DTOs;

namespace plantour_server.Services;

public interface IPackageService
{
    Task<IEnumerable<PackDto>> GetAllAsync();
    Task<IEnumerable<PackDto>> GetAllForTripAsync(Guid tripId);
    Task<PackDto?> GetByIdAsync(Guid id);
    Task<PackDto> AddAsync(CreatePackageRequest request);
    Task UpdateAsync(UpdatePackageRequest request);
    Task DeleteAsync(Guid id);
}
