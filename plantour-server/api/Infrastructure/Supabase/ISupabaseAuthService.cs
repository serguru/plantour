using pack_api.Infrastructure.Supabase.Models;

namespace pack_api.Infrastructure.Supabase;

public interface ISupabaseAuthService
{
    Task<SupabaseAuthResponse> SignUpAsync(SignUpRequest request, CancellationToken ct = default);
    Task<SupabaseAuthResponse> SignInAsync(SignInRequest request, CancellationToken ct = default);
    Task SignOutAsync(string accessToken, CancellationToken ct = default);
    Task SendPasswordResetAsync(PasswordResetRequest request, CancellationToken ct = default);
    Task<SupabaseUserProfile?> GetProfileAsync(string accessToken, CancellationToken ct = default);
    Task<SupabaseUserProfile?> UpdateProfileAsync(string accessToken, UpdateProfileRequest request, CancellationToken ct = default);
}