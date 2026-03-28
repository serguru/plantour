using plantour_server.DTOs;

namespace plantour_server.Services;

public interface IItineraryPartService
{
    Task<IEnumerable<ItineraryPartDto>> GetAllAsync(Guid tripId);
    Task<ItineraryPartDto?> GetByIdAsync(Guid tripId, Guid id);
    Task<ItineraryPartDto> AddAsync(CreateItineraryPartRequest request);
    Task UpdateAsync(UpdateItineraryPartRequest request);
    Task DeleteAsync(Guid tripId, Guid id);
}