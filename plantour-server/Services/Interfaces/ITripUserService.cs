using plantour_server.DTOs;

namespace plantour_server.Services;

public interface ITripUserService
{
    Task<IEnumerable<TripUserDto>> GetAllAsync(Guid tripId);
    Task<TripUserDto?> GetByIdAsync(Guid tripId, Guid id);
    Task<TripUserDto> AddAsync(CreateTripUserRequest request);
    Task UpdateAsync(UpdateTripUserRequest request);
    Task DeleteAsync(Guid tripId, Guid id);
    Task<int> InsertTripUsersAsync(Guid tripId, Guid[] packageIds);
    Task<int> DeleteTripUsersAsync(Guid tripId, Guid[] packageIds);
}
