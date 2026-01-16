using plantour_server.DTOs;

namespace plantour_server.Services;

public interface IAdminsParticipantService
{
    Task<IEnumerable<AdminsParticipantDto>> GetAllAsync();

    Task<IEnumerable<AdminsParticipantDto>> GetAllForTripAsync(Guid tripId);
    Task<AdminsParticipantDto?> GetByIdAsync(Guid id);
    Task UpdateAsync(UpdateAdminsParticipantRequest request);
    Task DeleteAsync(Guid id);
    Task<CheckParticipantDto> CheckParticipant(string email);
}
