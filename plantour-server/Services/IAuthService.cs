using plantour_server.DTOs;

namespace plantour_server.Services;

public interface IAuthService
{
    Task<AuthResponse> SignUpAsync(SignUpRequest request);
    Task<AuthResponse> SignInAsync(SignInRequest request);
    Task<AuthResponse> RefreshTokenAsync(string refreshToken);
    Task RevokeTokenAsync(string refreshToken);
    Task<bool> ValidateTokenAsync(string token);
}