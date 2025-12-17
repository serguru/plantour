using plantour_server.DTOs;

namespace plantour_server.Services;

public interface ITripUserService
{
    Task<IEnumerable<TripUserDto>> GetAllAsync(Guid tripId);
    Task<TripUserDto?> GetByIdAsync(Guid id);
    Task<TripUserDto> AddAsync(CreateTripUserRequest request);
    Task<bool> UpdateAsync(UpdateTripUserRequest request);
    Task<bool> DeleteAsync(Guid id);
    Task<int> InsertTripUsersAsync(Guid tripId, Guid[] packageIds);
    Task<int> DeleteTripUsersAsync(Guid tripId, Guid[] packageIds);
}
