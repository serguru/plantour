using plantour_server.DTOs;

namespace plantour_server.Services;

public interface ITripCommentService
{
    Task<IEnumerable<TripCommentDto>> GetAllAsync(Guid tripId);
    Task<TripCommentDto?> GetByIdAsync(Guid tripId, Guid id);
    Task<TripCommentDto> AddAsync(CreateTripCommentRequest request);
    Task UpdateAsync(UpdateTripCommentRequest request);
    Task DeleteAsync(Guid tripId, Guid id);
}
