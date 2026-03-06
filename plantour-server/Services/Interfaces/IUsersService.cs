using plantour_server.DTOs;

namespace plantour_server.Services;

public interface IUsersService
{
    // Admin authentication
    Task<SignInResponse> SendSignInEmailAdminAsync(SignInRequest request);
    Task<AuthResponse> SignInAdminSocialAsync(SocialSignInRequest request);
    Task<AuthResponse> SignInAdminTokenAsync(string token);


    // Participant authentication
    Task<AdminsParticipantDto> SignUpParticipantAsync(SignUpParticipantRequest request);
    Task<AuthResponse> SignInParticipantAsync(SignInParticipantRequest request);

    // Token management
    //Task<bool> ValidateTokenAsync(string token);


    // Profile management
    Task<UserDto> GetProfileAsync();
    Task<UserDto> UpdateProfileAsync(UpdateProfileRequest request);
    Task<UserDto> LinkSocialProviderAsync(SocialSignInRequest request);
    Task<UserDto> UnlinkSocialProviderAsync(string provider);

    Task<LandingDto> GetLandingAsync();

    Task<AuthResponseDto> RefreshTokenAsync(TokenRequestDto request);

    Task<ScheduledPlanDowngradeInfoDto> GetScheduledPlanDowngradeInfoAsync();

    Task<bool> CancelScheduledPlanDowngradeAsync();
}