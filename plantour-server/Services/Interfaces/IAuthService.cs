using plantour_server.DTOs;

namespace plantour_server.Services;

public interface IUsersService
{
    // Admin authentication
    Task<AuthResponse> SignUpAsync(SignUpRequest request);
    Task<AuthResponse> SignInAsync(SignInRequest request);
    Task<AuthResponse> SignInAdminSocialAsync(SocialSignInRequest request);

    // Participant authentication
    Task<AdminsParticipantDto> SignUpParticipantAsync(SignUpParticipantRequest request);
    Task<AuthResponse> SignInParticipantAsync(SignInParticipantRequest request);

    // Token management
    //Task<bool> ValidateTokenAsync(string token);

    // Email confirmation
    Task SendEmailConfirmationAsync(ResendEmailConfirmationRequest request, CancellationToken cancellationToken = default);
    Task<bool> ConfirmEmailAsync(ConfirmEmailRequest request);

    // Profile management
    Task<UserDto> GetProfileAsync();
    Task<UserDto> UpdateProfileAsync(UpdateProfileRequest request);
    Task UpdatePasswordAsync(UpdatePasswordRequest request);
    Task<UserDto> LinkSocialProviderAsync(SocialSignInRequest request);
    Task<UserDto> UnlinkSocialProviderAsync(string provider);

    Task<LandingDto> GetLandingAsync();

    Task<AuthResponseDto> RefreshTokenAsync(TokenRequestDto request);

    Task<ScheduledPlanDowngradeInfoDto> GetScheduledPlanDowngradeInfoAsync();

    Task<bool> CancelScheduledPlanDowngradeAsync();


}