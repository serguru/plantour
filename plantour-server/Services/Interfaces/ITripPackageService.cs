using plantour_server.DTOs;

namespace plantour_server.Services;

public interface ITripPackageService
{
    Task<IEnumerable<TripUserPackageDto>> GetAllAsync(Guid tripId);
    Task<TripUserPackageDto?> GetByIdAsync(Guid tripId, Guid id);
    Task<TripUserPackageDto> AddAsync(CreateTripPackageRequest request);
    Task UpdateAsync(UpdateTripPackageRequest request);
    Task DeleteAsync(Guid tripId, Guid id);
    Task<int> InsertTripUserPackagesAsync(Guid tripId, Guid[] packageIds);
    Task<int> DeleteTripUserPackagesAsync(Guid tripId, Guid[] packageIds);
}
