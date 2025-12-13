using plantour_server.DTOs;

namespace plantour_server.Services;

public interface IAuthService
{
    // Admin authentication
    Task<AuthResponse> SignUpAsync(SignUpRequest request);
    Task<AuthResponse> SignInAsync(SignInRequest request);

    // Participant authentication
    Task<AdminsParticipantDto> SignUpParticipantAsync(SignUpParticipantRequest request);
    Task<AuthResponse> SignInParticipantAsync(SignInParticipantRequest request);

    // Token management
    Task<bool> ValidateTokenAsync(string token);

}