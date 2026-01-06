using plantour_server.DTOs;

namespace plantour_server.Services;

public interface ITripService
{
    //Task<IEnumerable<TripDto>> GetAllAsync();
    //Task<IEnumerable<TripDto>> GetAllForParticipantAsync();
    
    //Task<TripDto?> GetByIdAsync(Guid id);
    Task<TripDto> AddAsync(CreateTripRequest request);
    Task UpdateAsync(UpdateTripRequest request);
    Task DeleteAsync(Guid tripId, Guid id);
//    Task<TripStatDto?> GetTripStatsAsync(Guid id);
    Task<IEnumerable<TripDto>> GetAllWithStatsAsync();
    Task<TripDto?> GetByIdWithStatsAsync(Guid id);

    Task<IEnumerable<TripDto>> GetAllWithStatsWhereParticipantAsync();
}
