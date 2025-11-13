using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using pack_api.Infrastructure.Supabase.Models;

namespace pack_api.Infrastructure.Supabase;

public class SupabaseAuthService : ISupabaseAuthService
{
    private readonly HttpClient _http;
    private readonly SupabaseOptions _opts;
    private readonly JsonSerializerOptions _jsonOptions = new() { PropertyNameCaseInsensitive = true, PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public SupabaseAuthService(HttpClient http, Microsoft.Extensions.Options.IOptions<SupabaseOptions> opts)
    {
        _http = http;
        _opts = opts.Value;
    }

    public async Task<SupabaseAuthResponse> SignUpAsync(SignUpRequest request, CancellationToken ct = default)
    {
        ArgumentNullException.ThrowIfNull(request);
        var url = $"{_opts.AuthUrl.TrimEnd('/')}/signup";
        var body = JsonSerializer.Serialize(request, _jsonOptions);
        using var resp = await _http.PostAsync(url, new StringContent(body, Encoding.UTF8, "application/json"), ct);
        resp.EnsureSuccessStatusCode();
        using var stream = await resp.Content.ReadAsStreamAsync(ct);
        using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: ct);
        // Best effort parsing (Supabase returns access_token etc. under "session" or directly)
        if (doc.RootElement.TryGetProperty("access_token", out var at))
        {
            return new SupabaseAuthResponse(at.GetString()!, doc.RootElement.GetProperty("refresh_token").GetString()!, doc.RootElement.GetProperty("token_type").GetString()!, doc.RootElement.GetProperty("expires_in").GetInt32());
        }
        if (doc.RootElement.TryGetProperty("session", out var session))
        {
            var access = session.GetProperty("access_token").GetString() ?? string.Empty;
            var refresh = session.GetProperty("refresh_token").GetString() ?? string.Empty;
            var type = session.GetProperty("token_type").GetString() ?? "bearer";
            var expires = session.GetProperty("expires_in").GetInt32();
            return new SupabaseAuthResponse(access, refresh, type, expires);
        }
        throw new InvalidOperationException("Unexpected signup response from Supabase.");
    }

    public async Task<SupabaseAuthResponse> SignInAsync(SignInRequest request, CancellationToken ct = default)
    {
        ArgumentNullException.ThrowIfNull(request);
        // Use token endpoint (password grant). Supabase accepts form-encoded grant_type=password.
        var url = $"{_opts.AuthUrl.TrimEnd('/')}/token?grant_type=password";
        var content = new FormUrlEncodedContent(new[] {
            new KeyValuePair<string,string>("email", request.Email),
            new KeyValuePair<string,string>("password", request.Password)
        });
        using var resp = await _http.PostAsync(url, content, ct);
        resp.EnsureSuccessStatusCode();
        var body = await resp.Content.ReadAsStringAsync(ct);
        var parsed = JsonSerializer.Deserialize<JsonElement>(body, _jsonOptions);
        var access = parsed.GetProperty("access_token").GetString() ?? string.Empty;
        var refresh = parsed.GetProperty("refresh_token").GetString() ?? string.Empty;
        var type = parsed.GetProperty("token_type").GetString() ?? "bearer";
        var expires = parsed.GetProperty("expires_in").GetInt32();
        return new SupabaseAuthResponse(access, refresh, type, expires);
    }

    public async Task SignOutAsync(string accessToken, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(accessToken)) throw new ArgumentException("accessToken required", nameof(accessToken));
        var url = $"{_opts.AuthUrl.TrimEnd('/')}/logout";
        using var req = new HttpRequestMessage(HttpMethod.Post, url);
        req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        using var resp = await _http.SendAsync(req, ct);
        resp.EnsureSuccessStatusCode();
    }

    public async Task SendPasswordResetAsync(PasswordResetRequest request, CancellationToken ct = default)
    {
        ArgumentNullException.ThrowIfNull(request);
        var url = $"{_opts.AuthUrl.TrimEnd('/')}/recover";
        var body = JsonSerializer.Serialize(new { email = request.Email }, _jsonOptions);
        using var resp = await _http.PostAsync(url, new StringContent(body, Encoding.UTF8, "application/json"), ct);
        resp.EnsureSuccessStatusCode();
    }

    public async Task<SupabaseUserProfile?> GetProfileAsync(string accessToken, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(accessToken)) throw new ArgumentException("accessToken required", nameof(accessToken));
        var url = $"{_opts.AuthUrl.TrimEnd('/')}/user";
        using var req = new HttpRequestMessage(HttpMethod.Get, url);
        req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        using var resp = await _http.SendAsync(req, ct);
        resp.EnsureSuccessStatusCode();
        var text = await resp.Content.ReadAsStringAsync(ct);
        var el = JsonSerializer.Deserialize<JsonElement>(text, _jsonOptions);
        // Map common fields
        return new SupabaseUserProfile(
            el.GetProperty("id").GetString() ?? string.Empty,
            el.GetProperty("email").GetString() ?? string.Empty,
            el.TryGetProperty("confirmed_at", out var conf) && !conf.ValueKind.Equals(JsonValueKind.Null)
        );
    }

    public async Task<SupabaseUserProfile?> UpdateProfileAsync(string accessToken, UpdateProfileRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(accessToken)) throw new ArgumentException("accessToken required", nameof(accessToken));
        var url = $"{_opts.AuthUrl.TrimEnd('/')}/user";
        using var req = new HttpRequestMessage(HttpMethod.Put, url);
        req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        var body = JsonSerializer.Serialize(new { user_metadata = new { full_name = request.FullName, avatar_url = request.AvatarUrl } }, _jsonOptions);
        req.Content = new StringContent(body, Encoding.UTF8, "application/json");
        using var resp = await _http.SendAsync(req, ct);
        resp.EnsureSuccessStatusCode();
        var txt = await resp.Content.ReadAsStringAsync(ct);
        var el = JsonSerializer.Deserialize<JsonElement>(txt, _jsonOptions);
        return new SupabaseUserProfile(
            el.GetProperty("id").GetString() ?? string.Empty,
            el.GetProperty("email").GetString() ?? string.Empty,
            el.TryGetProperty("confirmed_at", out var conf) && !conf.ValueKind.Equals(JsonValueKind.Null)
        );
    }
}