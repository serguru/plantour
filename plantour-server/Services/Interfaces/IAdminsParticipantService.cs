using plantour_server.DTOs;

namespace plantour_server.Services;

public interface IAdminsParticipantService
{
    Task<IEnumerable<AdminsParticipantDto>> GetAllAsync();
    Task<AdminsParticipantDto?> GetByIdAsync(Guid id);
    Task UpdateAsync(UpdateAdminsParticipantRequest request);
    Task DeleteAsync(Guid id);
}
