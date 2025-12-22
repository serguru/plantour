using plantour_server.DTOs;

namespace plantour_server.Services;

public interface ITripPackageService
{
    Task<IEnumerable<TripUserPackageDto>> GetAllAsync(Guid tripId);
    Task<TripUserPackageDto?> GetByIdAsync(Guid id);
    Task<TripUserPackageDto> AddAsync(CreateTripUserPackageRequest request);
    Task<bool> UpdateAsync(UpdateTripPackageRequest request);
    Task<bool> DeleteAsync(Guid id);
    Task<int> InsertTripUserPackagesAsync(Guid tripId, Guid[] packageIds);
    Task<int> DeleteTripUserPackagesAsync(Guid tripId, Guid[] packageIds);
}
