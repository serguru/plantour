using plantour_server.DTOs;

namespace plantour_server.Services;

public interface ITripService
{
    Task<IEnumerable<TripDto>> GetAllAsync();
    Task<TripDto?> GetByIdAsync(Guid id);
    Task<TripDto> AddAsync(CreateTripRequest request);
    Task<bool> UpdateAsync(UpdateTripRequest request);
    Task<bool> DeleteAsync(Guid id);
}
