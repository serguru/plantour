using plantour_maintenance_server.DTOs;

namespace plantour_maintenance_server.Services.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> SignInAsync(SignInRequest request, CancellationToken cancellationToken = default);
    Task<string> HashPasswordAsync(string password, CancellationToken cancellationToken = default);
}