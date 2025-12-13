using plantour_server.DTOs;

namespace plantour_server.Services;

public interface IAdminsParticipantService
{
    Task<IEnumerable<AdminsParticipantDto>> GetAllAsync();
    Task<AdminsParticipantDto?> GetByIdAsync(Guid id);
    Task<AdminsParticipantDto?> GetByEmailAsync(string email);
    Task<bool> UpdateAsync(UpdateAdminsParticipantRequest request);
    Task<bool> DeleteAsync(Guid id);
}
