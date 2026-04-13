using plantour_maintenance_server.DTOs;

namespace plantour_maintenance_server.Services.Interfaces;

public interface IUsersService
{
    Task<IReadOnlyList<UserDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<UserDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<UserDto> GetCurrentAsync(CancellationToken cancellationToken = default);
}