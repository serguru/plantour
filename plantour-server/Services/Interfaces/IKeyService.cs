using plantour_server.DTOs;

namespace plantour_server.Services;

public interface IKeyService
{
    Task<IEnumerable<KeyDto>> GetAllAsync();
    Task<KeyDto?> GetByIdAsync(Guid id);
    Task<KeyDto> AddAsync(CreateKeyRequest request);
    Task UpdateAsync(UpdateKeyRequest request);
    Task DeleteAsync(Guid id);
}