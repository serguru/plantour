using plantour_server.DTOs;

namespace plantour_server.Services;

public interface IUsersService
{
    // Admin authentication
    Task<AuthResponse> SignUpAsync(SignUpRequest request);
    Task<AuthResponse> SignInAsync(SignInRequest request);

    // Participant authentication
    Task<AdminsParticipantDto> SignUpParticipantAsync(SignUpParticipantRequest request);
    Task<AuthResponse> SignInParticipantAsync(SignInParticipantRequest request);

    // Token management
    Task<bool> ValidateTokenAsync(string token);
    Task<AuthResponse> RefreshTokenAsync(RefreshTokenRequest request, string? ipAddress);
    Task RevokeRefreshTokenAsync(RevokeRefreshTokenRequest request, string? ipAddress);

    // Email confirmation
    Task SendEmailConfirmationAsync(ResendEmailConfirmationRequest request, CancellationToken cancellationToken = default);
    Task<bool> ConfirmEmailAsync(ConfirmEmailRequest request);

    // Profile management
    Task<UserDto> GetProfileAsync();
    Task<UserDto> UpdateProfileAsync(UpdateProfileRequest request);
    Task UpdatePasswordAsync(UpdatePasswordRequest request);

    Task<LandingDto> GetLandingAsync();
}