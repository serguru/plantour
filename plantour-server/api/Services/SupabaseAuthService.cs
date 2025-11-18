using Supabase;
using Supabase.Gotrue;
using System;
using System.Threading.Tasks;


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

    User? GetUserByEmail(string email);
}


public class SupabaseAuthService : ISupabaseAuthService, IDisposable
{
    private readonly Supabase.Client _client;
    private readonly AdminClient _clientAdmin;
    private bool _initialized = false;

    public SupabaseAuthService(string supabaseUrl, string supabaseAnonKey, string supabaseServiceRoleKey)
    {
        var options = new SupabaseOptions
        {
            AutoConnectRealtime = false,
            AutoRefreshToken = true
        };

        _client = new Supabase.Client(supabaseUrl, supabaseAnonKey, options);

        var options1 = new ClientOptions
        {
            AutoRefreshToken = true,
            Url = $"{supabaseUrl}/auth/v1",
            Headers = new Dictionary<string, string>
            {
                { "apikey", supabaseServiceRoleKey },
                { "Authorization", $"Bearer {supabaseServiceRoleKey}" }
            }
        };

        _clientAdmin = new AdminClient(supabaseServiceRoleKey, options1);
    }

    // Initialize the client once (safe for DI singleton)
    private async Task EnsureInitializedAsync()
    {
        if (_initialized) return;
        await _client.InitializeAsync();
        _initialized = true;
    }

    public async Task<Session?> LoginWithPasswordAsync(string email, string password)
    {
        await EnsureInitializedAsync();
        // SignIn(email, password) returns Session
        var session = await _client.Auth.SignIn(email, password);
        return session;
    }

    public async Task<bool> SendMagicLinkAsync(string email)
    {
        await EnsureInitializedAsync();
        // SignIn with only email -> sends magic link / OTP depending on project settings
        await _client.Auth.SignIn(email);
        return true;
    }

    public async Task<User?> SignUpAsync(string email, string password, Dictionary<string, object>? metadata = null)
    {
        await EnsureInitializedAsync();
        SignUpOptions? signupOptions = metadata != null ? new SignUpOptions { Data = metadata } : null;
        await _client.Auth.SignUp(email, password, signupOptions);
        return _client.Auth.CurrentUser;
    }

    public async Task<bool> ResetPasswordAsync(string email)
    {
        await EnsureInitializedAsync();
        await _client.Auth.ResetPasswordForEmail(email);
        return true;
    }

    public async Task LogoutAsync()
    {
        await EnsureInitializedAsync();
        await _client.Auth.SignOut();
    }

    public async Task UpdateProfileAsync(Dictionary<string, object> newMetadata)
    {
        await EnsureInitializedAsync();
        if (_client.Auth.CurrentUser == null)
            throw new InvalidOperationException("No logged-in user (update requires a session).");

        //        var updateOptions = new UserUpdateOptions { Data = newMetadata };
        var updateOptions = new UserAttributes { Data = newMetadata };
        await _client.Auth.Update(updateOptions);
    }

    public string? GetAccessToken()
    {
        return _client.Auth.CurrentSession?.AccessToken;
    }

    public User? GetCurrentUser()
    {
        return _client.Auth.CurrentUser;
    }

    public User? GetUserByEmail(string email)
    {
        var list = _clientAdmin.ListUsers(email).Result;
        return list?.Users.FirstOrDefault();
    }

    public void Dispose()
    {
        // If Supabase client needs disposing later - keep for completeness
        // (Client currently doesn't require special dispose but safe to have)
    }
}
