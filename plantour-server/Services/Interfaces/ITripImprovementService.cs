using plantour_server.DTOs;

namespace plantour_server.Services;

public interface ITripImprovementService
{
    Task<IEnumerable<TripImprovementDto>> GetAllAsync(Guid tripId);
    Task<TripImprovementDto?> GetByIdAsync(Guid tripId, Guid id);
    Task<TripImprovementDto> AddAsync(CreateTripImprovementRequest request);
    Task UpdateAsync(UpdateTripImprovementRequest request);
    Task DeleteAsync(Guid tripId, Guid id);
    Task ToggleFinishedAsync(Guid tripId, Guid id, string? finished);
}