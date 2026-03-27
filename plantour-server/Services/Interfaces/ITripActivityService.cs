using plantour_server.DTOs;

namespace plantour_server.Services;

public interface ITripActivityService
{
    Task<IEnumerable<TripActivityDto>> GetAllPublicAsync(Guid tripId);
    Task<IEnumerable<TripActivityDto>> GetAllPersonalAsync(Guid tripId);
    
    Task<TripActivityDto?> GetPublicByIdAsync(Guid tripId, Guid id);
    Task<TripActivityDto?> GetPersonalByIdAsync(Guid tripId, Guid id);

    Task<TripActivityDto> AddPublicAsync(CreateTripActivityRequest request);
    Task<TripActivityDto> AddPersonalAsync(CreateTripActivityRequest request);

    Task UpdatePublicAsync(UpdateTripActivityRequest request);
    Task UpdatePersonalAsync(UpdateTripActivityRequest request);

    Task DeletePublicAsync(Guid id);
    Task DeletePersonalAsync(Guid id);
}
