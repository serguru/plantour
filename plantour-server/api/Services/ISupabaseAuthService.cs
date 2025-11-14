using Supabase.Gotrue;

namespace Plantour.Services;

public interface ISupabaseAuthService
{
    Task<Session?> LoginWithPasswordAsync(string email, string password);
    Task<bool> SendMagicLinkAsync(string email);
    Task<User?> SignUpAsync(string email, string password, Dictionary<string, object>? metadata = null);
    Task<bool> ResetPasswordAsync(string email);
    Task LogoutAsync();
    Task UpdateProfileAsync(Dictionary<string, object> newMetadata);
    string? GetAccessToken();
    User? GetCurrentUser();
}
