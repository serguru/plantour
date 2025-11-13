namespace pack_api.Infrastructure.Supabase.Models;

public record SignUpRequest(string Email, string Password);
public record SignInRequest(string Email, string Password);
public record PasswordResetRequest(string Email);
public record UpdateProfileRequest(string FullName, string? AvatarUrl);

public record SupabaseAuthResponse(string AccessToken, string RefreshToken, string TokenType, int ExpiresIn);
public record SupabaseUserProfile(string Id, string Email, bool EmailConfirmed, IDictionary<string, object>? AppMeta = null, IDictionary<string, object>? UserMeta = null);