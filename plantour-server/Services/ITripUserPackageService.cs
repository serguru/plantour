using plantour_server.DTOs;

namespace plantour_server.Services;

public interface ITripUserPackageService
{
    Task<IEnumerable<TripUserPackageDto>> GetAllAsync(Guid tripId);
    Task<TripUserPackageDto?> GetByIdAsync(Guid id);
    Task<TripUserPackageDto> AddAsync(CreateTripUserPackageRequest request);
    Task<bool> UpdateAsync(UpdateTripUserPackageRequest request);
    Task<bool> DeleteAsync(Guid id);
    Task<int> InsertTripUserPackagesAsync(Guid tripId, Guid[] packageIds);
}
