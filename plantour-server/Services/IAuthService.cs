using plantour_server.DTOs;

namespace plantour_server.Services;

public interface IAuthService
{
    // Admin authentication
    Task<AuthResponse> SignUpAsync(SignUpRequest request);
    Task<AuthResponse> SignInAsync(SignInRequest request);

    // Participant authentication
    Task<AuthResponse> SignUpParticipantAsync(SignUpParticipantRequest request);
    Task<AuthResponse> SignInParticipantAsync(SignInParticipantRequest request);

    // Token management
    Task<object> RefreshTokenAsync(string refreshToken);
    Task RevokeTokenAsync(string refreshToken);
    Task<bool> ValidateTokenAsync(string token);

    // Helper methods
    Task<string> GenerateAccessCodeAsync(Guid adminId, Guid participantId);
}