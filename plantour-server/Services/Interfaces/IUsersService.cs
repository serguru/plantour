using plantour_server.DTOs;

namespace plantour_server.Services;

public interface IUsersService
{
    // Admin authentication
    Task<SignInResponse> SendSignInEmailAdminAsync(SignInRequest request);
    Task<AuthResponse> SignInAdminSocialAsync(SocialSignInRequest request);
    Task<AuthResponse> SignInAdminTokenAsync(string token);
    string BuildGoogleOAuthAuthorizeUrl(string callbackUrl, string? returnUrl);
    Task<string> HandleGoogleOAuthCallbackAsync(string callbackUrl, string? code, string? state, string? error);
    Task<AuthResponse> CompleteGoogleOAuthSignInAsync(string protectedGoogleOAuthToken);
    string BuildFacebookOAuthAuthorizeUrl(string callbackUrl, string? returnUrl);
    Task<string> HandleFacebookOAuthCallbackAsync(string callbackUrl, string? code, string? state, string? error, string? errorReason, string? errorDescription);
    Task<AuthResponse> CompleteFacebookOAuthSignInAsync(string protectedFacebookOAuthToken);


    // Participant authentication
    Task<AdminsParticipantDto> SignUpParticipantAsync(SignUpParticipantRequest request);
    Task<AuthResponse> SignInParticipantAsync(SignInParticipantRequest request);

    // Profile management
    Task<UserDto> GetProfileAsync();
    Task<object> UpdateProfileAsync(UpdateProfileRequest request);
    Task<UserDto> LinkSocialProviderAsync(SocialSignInRequest request);
    Task<UserDto> UnlinkSocialProviderAsync(string provider);

    Task<LandingDto> GetLandingAsync();

    Task<AuthResponseDto> RefreshTokenAsync(TokenRequestDto request);

    Task<ScheduledPlanDowngradeInfoDto> GetScheduledPlanDowngradeInfoAsync();

    Task<bool> CancelScheduledPlanDowngradeAsync();

    Task<bool> IsUserTemporary(string email);
    Task ConvertTemporaryUserAsync(string oldEmail, string newEmail);
    Task SendParticipantInvitationAsync(Guid adminParticipantId);

    Task<string> GetDbVersion();
    Task<ClientSettingsDto> GetClientSettingsAsync();
    

}