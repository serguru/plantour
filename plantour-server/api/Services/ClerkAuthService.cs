using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;

namespace Plantour.Services
{
    /// <summary>
    /// Simple Clerk admin REST API client used for authentication operations.
    /// Uses admin API key from configuration to call Clerk endpoints.
    /// Replace endpoints with your Clerk project specifics if needed.
    /// </summary>
    public class ClerkAuthService : IClerkAuthService
    {
        private readonly HttpClient _http;
        private readonly IConfiguration _configuration;
        private readonly ILogger<ClerkAuthService> _log;
        private readonly string _apiKey;

        public ClerkCurrentUser? CurrentUser { get; private set; }

        public ClerkAuthService(HttpClient http, IConfiguration configuration, ILogger<ClerkAuthService> log)
        {
            _http = http;
            _configuration = configuration;
            _log = log;
            _apiKey = configuration["Clerk:ApiKey"] ?? throw new InvalidOperationException("Clerk:ApiKey is required.");
        }

        private void AddAdminAuthHeader(HttpRequestMessage req)
        {
            // Admin endpoints use the API key in Authorization header
            if (!req.Headers.Contains("Authorization"))
                req.Headers.Add("Authorization", $"Bearer {_apiKey}");
        }

        // C#
        public async Task<bool> UserExistsAsync(string email)
        {
            var req = new HttpRequestMessage(HttpMethod.Get, $"/v1/users?email={Uri.EscapeDataString(email)}");
            AddAdminAuthHeader(req);
            var resp = await _http.SendAsync(req);
            if (!resp.IsSuccessStatusCode) return false;

            using var doc = await JsonDocument.ParseAsync(await resp.Content.ReadAsStreamAsync());
            if (doc.RootElement.ValueKind == JsonValueKind.Array && doc.RootElement.GetArrayLength() > 0)
                return true;

            // Some Clerk deployments return an object { data: [...] }
            if (doc.RootElement.ValueKind == JsonValueKind.Object
                && doc.RootElement.TryGetProperty("data", out var data)
                && data.ValueKind == JsonValueKind.Array
                && data.GetArrayLength() > 0)
            {
                return true;
            }

            return false;
        }

        public async Task<bool> SignUpAsync(string email, string password, Dictionary<string, object>? metadata = null)
        {
            // Validate basic requirements from Clerk API: email present and password policy (min 8 chars)
            if (string.IsNullOrWhiteSpace(email))
            {
                _log.LogWarning("Clerk SignUp aborted: email is empty");
                return false;
            }

            if (password == null || password.Length < 8)
            {
                _log.LogWarning("Clerk SignUp aborted: password does not meet minimum length (8)");
                return false;
            }

            // Clerk /users create expects "email_address" as an array of strings and other fields like "password" and "public_metadata".
            var payload = new Dictionary<string, object?>
            {
                ["email_address"] = new[] { email },
                ["password"] = password
            };
            if (metadata != null)
                payload["public_metadata"] = metadata;

            var req = new HttpRequestMessage(HttpMethod.Post, "/v1/users")
            {
                Content = JsonContent.Create(payload)
            };
            AddAdminAuthHeader(req);

            HttpResponseMessage resp;
            try
            {
                _log.LogDebug("Clerk SignUp attempt: payload={Payload}", JsonSerializer.Serialize(payload));
                resp = await _http.SendAsync(req);
            }
            catch (Exception ex)
            {
                _log.LogWarning(ex, "Clerk SignUp request failed to send");
                return false;
            }

            if (resp.IsSuccessStatusCode)
            {
                return true;
            }

            // Log useful diagnostics to find the root cause
            try
            {
                var body = await resp.Content.ReadAsStringAsync();
                _log.LogWarning("Clerk SignUp failed. StatusCode: {StatusCode}. Reason: {ReasonPhrase}. ResponseBody: {Body}",
                    (int)resp.StatusCode, resp.ReasonPhrase, string.IsNullOrWhiteSpace(body) ? "<empty>" : body);

                // If clerk_trace_id present surface it separately for easier support lookups
                try
                {
                    using var doc = JsonDocument.Parse(body);
                    if (doc.RootElement.TryGetProperty("clerk_trace_id", out var traceEl) && traceEl.ValueKind == JsonValueKind.String)
                        _log.LogWarning("Clerk trace id: {TraceId}", traceEl.GetString());
                }
                catch
                {
                    // ignore parse errors
                }
            }
            catch (Exception ex)
            {
                _log.LogWarning(ex, "Failed to read Clerk SignUp response body");
            }

            return false;
        }

        public async Task<string?> SignInAsync(string email, string password)
        {
            // Clerk: create session via /v1/sessions; response contains created session and token
            var payload = new Dictionary<string, object?>
            {
                ["identifier"] = email,
                ["password"] = password
            };
            var req = new HttpRequestMessage(HttpMethod.Post, "/v1/sessions")
            {
                Content = JsonContent.Create(payload)
            };
            AddAdminAuthHeader(req);
            var resp = await _http.SendAsync(req);
            if (!resp.IsSuccessStatusCode) return null;

            using var doc = await JsonDocument.ParseAsync(await resp.Content.ReadAsStreamAsync());
            // Try common shapes: { "session": { "token": "..." } } or { "access_token": "..." }
            if (doc.RootElement.TryGetProperty("access_token", out var at))
                return at.GetString();

            if (doc.RootElement.TryGetProperty("session", out var session) && session.TryGetProperty("token", out var tokEl))
                return tokEl.GetString();

            // fallback: return null
            return null;
        }

        public async Task SendMagicLinkAsync(string email)
        {
            // Clerk magic link: trigger via /v1/links or /v1/magic_links depending on project.
            // Attempt a generic endpoint - adapt if your Clerk project differs.
            var payload = new { email = email, type = "magic_link" };
            var req = new HttpRequestMessage(HttpMethod.Post, "/v1/magic_links")
            {
                Content = JsonContent.Create(payload)
            };
            AddAdminAuthHeader(req);
            await _http.SendAsync(req);
        }

        public async Task ResetPasswordAsync(string email)
        {
            var payload = new { email = email };
            var req = new HttpRequestMessage(HttpMethod.Post, "/v1/passwords/reset")
            {
                Content = JsonContent.Create(payload)
            };
            AddAdminAuthHeader(req);
            await _http.SendAsync(req);
        }

        public async Task SignOutAsync(string? token = null)
        {
            // Clerk session revocation - attempt to revoke current session if token provided
            try
            {
                if (!string.IsNullOrEmpty(token))
                {
                    var req = new HttpRequestMessage(HttpMethod.Post, "/v1/sessions/revoke")
                    {
                        Content = JsonContent.Create(new { token })
                    };
                    AddAdminAuthHeader(req);
                    await _http.SendAsync(req);
                }
            }
            catch (Exception ex)
            {
                _log.LogWarning(ex, "SignOut failed");
            }
        }

        public async Task UpdateProfileAsync(string clerkUserId, Dictionary<string, object> newMetadata)
        {
            var req = new HttpRequestMessage(HttpMethod.Patch, $"/v1/users/{Uri.EscapeDataString(clerkUserId)}")
            {
                Content = JsonContent.Create(new { public_metadata = newMetadata })
            };
            AddAdminAuthHeader(req);
            var resp = await _http.SendAsync(req);
            resp.EnsureSuccessStatusCode();
        }

        public async Task<bool> ValidateTokenAsync(string token)
        {
            try
            {
                var req = new HttpRequestMessage(HttpMethod.Post, "/v1/jwt/verify")
                {
                    Content = JsonContent.Create(new { token })
                };
                AddAdminAuthHeader(req);
                var resp = await _http.SendAsync(req);
                return resp.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                _log.LogWarning(ex, "Token validation failed");
                return false;
            }
        }

        public async Task<ClerkUserInfo?> GetUserByEmailAsync(string email)
        {
            var req = new HttpRequestMessage(HttpMethod.Get, $"/v1/users?email={Uri.EscapeDataString(email)}");
            AddAdminAuthHeader(req);
            var resp = await _http.SendAsync(req);
            if (!resp.IsSuccessStatusCode) return null;
            using var doc = await JsonDocument.ParseAsync(await resp.Content.ReadAsStreamAsync());
            JsonElement userEl;
            if (doc.RootElement.ValueKind == JsonValueKind.Array && doc.RootElement.GetArrayLength() > 0)
                userEl = doc.RootElement[0];
            else if (doc.RootElement.TryGetProperty("data", out var data) && data.ValueKind == JsonValueKind.Array && data.GetArrayLength() > 0)
                userEl = data[0];
            else
                return null;

            // Try to extract id/email
            string? id = userEl.TryGetProperty("id", out var idEl) ? idEl.GetString() : null;
            string? mail = userEl.TryGetProperty("email_address", out var e1) ? e1.GetString()
                         : userEl.TryGetProperty("email", out var e2) ? e2.GetString()
                         : null;

            if (id == null && mail == null) return null;
            return new ClerkUserInfo { Id = id, Email = mail };
        }
    }

    public class ClerkCurrentUser
    {
        public string? ClerkUserId { get; set; }
        public string? Email { get; set; }
    }

    public class ClerkUserInfo
    {
        public string? Id { get; set; }
        public string? Email { get; set; }
    }
}