using plantour_server.DTOs;

namespace plantour_server.Services;

public interface ITripPackageService
{
    Task<IEnumerable<TripPackageDto>> GetAllAsync(Guid tripId);
    Task<TripPackageDto?> GetByIdAsync(Guid tripId, Guid id);
    Task<TripPackageDto> AddAsync(CreateTripPackageRequest request);
    Task UpdateAsync(UpdateTripPackageRequest request);
    Task DeleteAsync(Guid tripId, Guid id);
    Task<int> InsertTripUserPackagesAsync(Guid tripId, Guid[] packageIds);
    Task<int> DeleteTripUserPackagesAsync(Guid tripId, Guid[] packageIds);
}
