using plantour_server.DTOs;

namespace plantour_server.Services;

public interface ITemporaryUserService
{
    Task<CreateTemporaryUserResponse> CreateTemporaryUserAsync();
}
