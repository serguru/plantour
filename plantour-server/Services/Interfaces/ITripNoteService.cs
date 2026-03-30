using plantour_server.DTOs;

namespace plantour_server.Services;

public interface ITripNoteService
{
    Task<IEnumerable<TripNoteDto>> GetAllAsync(Guid tripId);
    Task<TripNoteDto?> GetByIdAsync(Guid tripId, Guid id);
    Task<TripNoteDto> AddAsync(CreateTripNoteRequest request);
    Task UpdateAsync(UpdateTripNoteRequest request);
    Task DeleteAsync(Guid tripId, Guid id);
}