using System.Net.Http.Headers;
using System.Text;
using System.Text.Encodings.Web;
using System.Text.Json;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Options;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Models;
using plantour_server.Repositories;
using PlantourApi.Middleware;
using PlantourApi.Models;

namespace plantour_server.Services;

public class TripNoteEditorService(
    IOptions<TripNoteEditorSettings> settings,
    HttpCurrentUser httpCurrentUser,
    KeyRepository keyRepository,
    IHttpClientFactory httpClientFactory,
    IHttpContextAccessor httpContextAccessor,
    IDataProtectionProvider dataProtectionProvider) : ITripNoteEditorService
{
    private const string DropboxAuthUrl = "https://www.dropbox.com/oauth2/authorize";
    private const string DropboxTokenUrl = "https://api.dropboxapi.com/oauth2/token";
    private const string DropboxApiBaseUrl = "https://api.dropboxapi.com/2";
    private const string DropboxKeyName = "trip-note-editor.dropbox";
    private const string StateProtectorPurpose = "trip-note-editor-dropbox-state";
    private static readonly TimeSpan StateTtl = TimeSpan.FromMinutes(15);
    private static readonly TimeSpan TokenRefreshBuffer = TimeSpan.FromMinutes(2);
    private static readonly HashSet<string> SupportedImageExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".png",
        ".jpg",
        ".jpeg",
        ".gif",
        ".webp",
        ".bmp",
        ".svg"
    };

    private readonly TripNoteEditorSettings _settings = settings.Value;
    private readonly CurrentUser _currentUser = httpCurrentUser.CurrentUser;
    private readonly KeyRepository _keyRepository = keyRepository;
    private readonly IHttpClientFactory _httpClientFactory = httpClientFactory;
    private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;
    private readonly IDataProtector _stateProtector = dataProtectionProvider.CreateProtector(StateProtectorPurpose);

    public async Task<TripNoteEditorConfigDto> GetConfigAsync()
    {
        _currentUser.RaiseIfNotAuthenticated();

        var token = await GetStoredTokenAsync(_currentUser.UserId);
        return new TripNoteEditorConfigDto
        {
            TinyMceApiKey = string.IsNullOrWhiteSpace(_settings.TinyMceApiKey) ? "no-api-key" : _settings.TinyMceApiKey.Trim(),
            DropboxEnabled = HasDropboxAppSettings(),
            DropboxConnected = token != null,
            DropboxDisplayName = token?.DisplayName,
        };
    }

    public Task<TripNoteEditorDropboxConnectUrlDto> CreateDropboxConnectUrlAsync(TripNoteEditorDropboxConnectUrlRequest request)
    {
        _currentUser.RaiseIfNotAuthenticated();
        EnsureDropboxConfigured();

        var frontendOrigin = NormalizeFrontendOrigin(request.FrontendOrigin);
        ValidateFrontendOriginMatchesRequest(frontendOrigin);
        var frontendPath = NormalizeFrontendPath(request.FrontendPath);
        var callbackUrl = BuildAbsoluteCallbackUrl();
        var statePayload = new DropboxStatePayload(_currentUser.UserId, _currentUser.AdminId, frontendOrigin, frontendPath, DateTimeOffset.UtcNow);
        var protectedState = Uri.EscapeDataString(_stateProtector.Protect(JsonSerializer.Serialize(statePayload)));

        var authorizationUrl = new StringBuilder(DropboxAuthUrl)
            .Append("?client_id=").Append(Uri.EscapeDataString(_settings.DropboxAppKey.Trim()))
            .Append("&response_type=code")
            .Append("&token_access_type=offline")
            .Append("&redirect_uri=").Append(Uri.EscapeDataString(callbackUrl))
            .Append("&state=").Append(protectedState)
            .ToString();

        return Task.FromResult(new TripNoteEditorDropboxConnectUrlDto
        {
            AuthorizationUrl = authorizationUrl,
            RedirectUri = callbackUrl,
        });
    }

    public async Task<TripNoteEditorDropboxCallbackResultDto> CompleteDropboxAuthorizationAsync(string? code, string? state, string? error, string? errorDescription)
    {
        DropboxStatePayload? payload = null;

        try
        {
            payload = UnprotectState(state);
            if (!string.IsNullOrWhiteSpace(error))
            {
                return BuildCallbackResult(payload.FrontendOrigin, payload.FrontendPath, false, errorDescription ?? error);
            }

            if (string.IsNullOrWhiteSpace(code))
            {
                return BuildCallbackResult(payload.FrontendOrigin, payload.FrontendPath, false, "Dropbox did not return an authorization code.");
            }

            EnsureDropboxConfigured();

            var token = await ExchangeAuthorizationCodeAsync(code.Trim());
            var account = await GetCurrentDropboxAccountAsync(token.AccessToken);
            var storedToken = token with { DisplayName = account.DisplayName };

            await SaveTokenAsync(payload.UserId, storedToken);
            return BuildCallbackResult(payload.FrontendOrigin, payload.FrontendPath, true, account.DisplayName ?? "Dropbox connected.");
        }
        catch (Exception ex)
        {
            if (payload != null)
            {
                return BuildCallbackResult(payload.FrontendOrigin, payload.FrontendPath, false, ex.Message);
            }

            return new TripNoteEditorDropboxCallbackResultDto
            {
                Html = BuildStatusHtml(false, ex.Message),
            };
        }
    }

    public async Task DisconnectDropboxAsync()
    {
        _currentUser.RaiseIfNotAuthenticated();

        var existing = await _keyRepository.GetByNameAsync(_currentUser.UserId, DropboxKeyName);
        if (existing == null)
        {
            return;
        }

        await _keyRepository.DeleteAsync(existing.Id);
    }

    public async Task<TripNoteEditorDropboxBrowserDto> BrowseDropboxAsync(TripNoteEditorDropboxBrowseRequest request)
    {
        _currentUser.RaiseIfNotAuthenticated();
        var token = await GetValidTokenForCurrentUserAsync();
        var path = NormalizeDropboxPath(request.Path);

        using var response = await SendDropboxApiAsync(token.AccessToken, "/files/list_folder", new
        {
            path,
            recursive = false,
            include_deleted = false,
            include_mounted_folders = true,
            limit = 200,
        });

        using var content = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync());
        var entries = new List<DropboxBrowserEntry>();
        foreach (var entry in content.RootElement.GetProperty("entries").EnumerateArray())
        {
            var tag = entry.GetProperty(".tag").GetString();
            var name = entry.GetProperty("name").GetString() ?? string.Empty;
            var entryPath = entry.TryGetProperty("path_display", out var pathDisplay)
                ? pathDisplay.GetString() ?? string.Empty
                : entry.TryGetProperty("path_lower", out var pathLower)
                    ? pathLower.GetString() ?? string.Empty
                    : string.Empty;

            if (tag == "folder")
            {
                entries.Add(new DropboxBrowserEntry(entry.GetProperty("id").GetString() ?? entryPath, name, entryPath, true, null));
                continue;
            }

            if (tag == "file" && IsSupportedImageName(name))
            {
                entries.Add(new DropboxBrowserEntry(entry.GetProperty("id").GetString() ?? entryPath, name, entryPath, false, null));
            }
        }

        var resolvedEntries = await ResolvePreviewLinksAsync(token.AccessToken, entries);
        return new TripNoteEditorDropboxBrowserDto
        {
            CurrentPath = path,
            ParentPath = GetParentPath(path),
            Entries = resolvedEntries
                .OrderBy(x => x.IsFolder ? 0 : 1)
                .ThenBy(x => x.Name, StringComparer.OrdinalIgnoreCase)
                .Select(x => new TripNoteEditorDropboxBrowserEntryDto
                {
                    Id = x.Id,
                    Name = x.Name,
                    Path = x.Path,
                    IsFolder = x.IsFolder,
                    PreviewUrl = x.PreviewUrl,
                })
                .ToList(),
        };
    }

    public async Task<TripNoteEditorResolvedDropboxImagesDto> ResolveDropboxImagesAsync(TripNoteEditorResolveDropboxImagesRequest request)
    {
        _currentUser.RaiseIfNotAuthenticated();
        var images = await ResolveDropboxTemporaryLinksAsync(request.Paths);

        return new TripNoteEditorResolvedDropboxImagesDto
        {
            Images = images
                .Select(x => new TripNoteEditorResolvedDropboxImageDto { Path = x.Key, Url = x.Value })
                .ToList(),
        };
    }

    public async Task<Dictionary<string, string>> ResolveDropboxTemporaryLinksAsync(IEnumerable<string> paths)
    {
        _currentUser.RaiseIfNotAuthenticated();
        var token = await GetValidTokenForCurrentUserAsync();
        var normalizedPaths = paths
            .Select(NormalizeDropboxPath)
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Take(50)
            .ToList();

        var tasks = normalizedPaths.Select(async path => new KeyValuePair<string, string?>(path, await TryGetTemporaryLinkAsync(token.AccessToken, path)));
        var pairs = await Task.WhenAll(tasks);
        return pairs
            .Where(x => !string.IsNullOrWhiteSpace(x.Value))
            .ToDictionary(x => x.Key, x => x.Value!, StringComparer.OrdinalIgnoreCase);
    }

    private async Task<DropboxTokenRecord> GetValidTokenForCurrentUserAsync()
    {
        var token = await GetStoredTokenAsync(_currentUser.UserId)
            ?? throw new CustomException("Connect Dropbox first to browse or render private images.");

        if (!NeedsRefresh(token))
        {
            return token;
        }

        if (string.IsNullOrWhiteSpace(token.RefreshToken))
        {
            throw new CustomException("Dropbox authorization expired. Reconnect Dropbox and try again.");
        }

        var refreshed = await RefreshAccessTokenAsync(token.RefreshToken);
        var merged = refreshed with
        {
            RefreshToken = token.RefreshToken,
            AccountId = string.IsNullOrWhiteSpace(refreshed.AccountId) ? token.AccountId : refreshed.AccountId,
            DisplayName = string.IsNullOrWhiteSpace(refreshed.DisplayName) ? token.DisplayName : refreshed.DisplayName,
        };

        await SaveTokenAsync(_currentUser.UserId, merged);
        return merged;
    }

    private async Task<DropboxTokenRecord?> GetStoredTokenAsync(Guid userId)
    {
        var key = await _keyRepository.GetByNameAsync(userId, DropboxKeyName);
        if (key == null || !key.Active || string.IsNullOrWhiteSpace(key.Key))
        {
            return null;
        }

        try
        {
            return JsonSerializer.Deserialize<DropboxTokenRecord>(key.Key);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private async Task SaveTokenAsync(Guid userId, DropboxTokenRecord token)
    {
        var existing = await _keyRepository.GetByNameAsync(userId, DropboxKeyName);
        var serialized = JsonSerializer.Serialize(token);

        if (existing == null)
        {
            await _keyRepository.AddAsync(new UserKey
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Name = DropboxKeyName,
                Key = serialized,
                Active = true,
                CreatedAt = DateTime.UtcNow,
                Notes = token.DisplayName,
            });

            return;
        }

        existing.Key = serialized;
        existing.Active = true;
        existing.Notes = token.DisplayName;
        await _keyRepository.UpdateAsync(existing);
    }

    private async Task<DropboxTokenRecord> ExchangeAuthorizationCodeAsync(string code)
    {
        using var request = new HttpRequestMessage(HttpMethod.Post, DropboxTokenUrl)
        {
            Content = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["code"] = code,
                ["grant_type"] = "authorization_code",
                ["client_id"] = _settings.DropboxAppKey.Trim(),
                ["client_secret"] = _settings.DropboxAppSecret.Trim(),
                ["redirect_uri"] = BuildAbsoluteCallbackUrl(),
            })
        };

        using var response = await _httpClientFactory.CreateClient().SendAsync(request);
        await EnsureSuccessAsync(response, "Dropbox authorization failed.");
        using var document = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync());
        return ParseDropboxToken(document.RootElement);
    }

    private async Task<DropboxTokenRecord> RefreshAccessTokenAsync(string refreshToken)
    {
        using var request = new HttpRequestMessage(HttpMethod.Post, DropboxTokenUrl)
        {
            Content = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["refresh_token"] = refreshToken,
                ["grant_type"] = "refresh_token",
                ["client_id"] = _settings.DropboxAppKey.Trim(),
                ["client_secret"] = _settings.DropboxAppSecret.Trim(),
            })
        };

        using var response = await _httpClientFactory.CreateClient().SendAsync(request);
        await EnsureSuccessAsync(response, "Dropbox token refresh failed.");
        using var document = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync());
        return ParseDropboxToken(document.RootElement) with { RefreshToken = refreshToken };
    }

    private async Task<DropboxAccountRecord> GetCurrentDropboxAccountAsync(string accessToken)
    {
        using var response = await SendDropboxApiAsync(accessToken, "/users/get_current_account", null);
        using var document = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync());
        var name = document.RootElement.TryGetProperty("name", out var nameNode) &&
                   nameNode.TryGetProperty("display_name", out var displayNameNode)
            ? displayNameNode.GetString()
            : null;

        return new DropboxAccountRecord(
            document.RootElement.TryGetProperty("account_id", out var accountIdNode) ? accountIdNode.GetString() : null,
            name);
    }

    private async Task<IReadOnlyList<DropboxBrowserEntry>> ResolvePreviewLinksAsync(string accessToken, IReadOnlyList<DropboxBrowserEntry> entries)
    {
        var tasks = entries.Select(async entry =>
        {
            if (entry.IsFolder)
            {
                return entry;
            }

            var previewUrl = await TryGetTemporaryLinkAsync(accessToken, entry.Path);
            return entry with { PreviewUrl = previewUrl };
        });

        return await Task.WhenAll(tasks);
    }

    private async Task<string?> TryGetTemporaryLinkAsync(string accessToken, string path)
    {
        try
        {
            using var response = await SendDropboxApiAsync(accessToken, "/files/get_temporary_link", new { path });
            using var document = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync());
            return document.RootElement.TryGetProperty("link", out var link) ? link.GetString() : null;
        }
        catch
        {
            return null;
        }
    }

    private async Task<HttpResponseMessage> SendDropboxApiAsync(string accessToken, string endpoint, object? body)
    {
        using var request = new HttpRequestMessage(HttpMethod.Post, $"{DropboxApiBaseUrl}{endpoint}");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        request.Content = new StringContent(body == null ? "null" : JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");

        var response = await _httpClientFactory.CreateClient().SendAsync(request);
        await EnsureSuccessAsync(response, "Dropbox request failed.");
        return response;
    }

    private async Task EnsureSuccessAsync(HttpResponseMessage response, string defaultMessage)
    {
        if (response.IsSuccessStatusCode)
        {
            return;
        }

        var content = await response.Content.ReadAsStringAsync();
        var message = defaultMessage;

        if (!string.IsNullOrWhiteSpace(content))
        {
            try
            {
                using var document = JsonDocument.Parse(content);
                if (document.RootElement.TryGetProperty("error_description", out var errorDescription) && errorDescription.ValueKind == JsonValueKind.String)
                {
                    message = errorDescription.GetString() ?? defaultMessage;
                }
                else if (document.RootElement.TryGetProperty("error_summary", out var errorSummary) && errorSummary.ValueKind == JsonValueKind.String)
                {
                    message = errorSummary.GetString() ?? defaultMessage;
                }
            }
            catch (JsonException)
            {
                message = content;
            }
        }

        response.Dispose();
        throw new CustomException(message);
    }

    private void EnsureDropboxConfigured()
    {
        if (!HasDropboxAppSettings())
        {
            throw new CustomException("TripNoteEditorSettings are missing. Configure Dropbox app credentials in appsettings or environment variables.");
        }
    }

    private bool HasDropboxAppSettings()
    {
        return !string.IsNullOrWhiteSpace(_settings.DropboxAppKey)
            && !string.IsNullOrWhiteSpace(_settings.DropboxAppSecret)
            && !string.IsNullOrWhiteSpace(_settings.DropboxRedirectUri);
    }

    private string BuildAbsoluteCallbackUrl()
    {
        var configured = _settings.DropboxRedirectUri?.Trim();
        if (!string.IsNullOrWhiteSpace(configured))
        {
            if (!Uri.TryCreate(configured, UriKind.Absolute, out var configuredUri)
                || (configuredUri.Scheme != Uri.UriSchemeHttp && configuredUri.Scheme != Uri.UriSchemeHttps))
            {
                throw new CustomException("TripNoteEditorSettings:DropboxRedirectUri must be a valid absolute http or https URL.");
            }

            return configuredUri.ToString();
        }

        var request = _httpContextAccessor.HttpContext?.Request
            ?? throw new CustomException("HTTP request context is unavailable.");

        return $"{request.Scheme}://{request.Host}/trip-note-editor/dropbox/callback";
    }

    private DropboxStatePayload UnprotectState(string? state)
    {
        if (string.IsNullOrWhiteSpace(state))
        {
            throw new CustomException("Missing Dropbox authorization state.");
        }

        try
        {
            var json = _stateProtector.Unprotect(state);
            var payload = JsonSerializer.Deserialize<DropboxStatePayload>(json)
                ?? throw new CustomException("Invalid Dropbox authorization state.");

            if (DateTimeOffset.UtcNow - payload.IssuedAt > StateTtl)
            {
                throw new CustomException("Dropbox authorization expired. Start the connection again.");
            }

            return payload;
        }
        catch (CustomException)
        {
            throw;
        }
        catch
        {
            throw new CustomException("Invalid Dropbox authorization state.");
        }
    }

    private static string NormalizeFrontendOrigin(string value)
    {
        if (!Uri.TryCreate(value, UriKind.Absolute, out var uri) || (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps))
        {
            throw new CustomException("A valid frontend origin is required to connect Dropbox.");
        }

        return uri.GetLeftPart(UriPartial.Authority);
    }

    private static string NormalizeFrontendPath(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new CustomException("A valid frontend path is required to connect Dropbox.");
        }

        var trimmed = value.Trim();
        if (!trimmed.StartsWith('/'))
        {
            throw new CustomException("Dropbox connection must return to a frontend route path.");
        }

        return trimmed;
    }

    private void ValidateFrontendOriginMatchesRequest(string frontendOrigin)
    {
        var request = _httpContextAccessor.HttpContext?.Request;
        if (request == null)
        {
            return;
        }

        var requestOrigin = request.Headers.Origin.FirstOrDefault();
        if (string.IsNullOrWhiteSpace(requestOrigin))
        {
            requestOrigin = request.Headers.Referer.FirstOrDefault();
        }

        if (string.IsNullOrWhiteSpace(requestOrigin) || !Uri.TryCreate(requestOrigin, UriKind.Absolute, out var requestUri))
        {
            return;
        }

        var normalizedRequestOrigin = requestUri.GetLeftPart(UriPartial.Authority);
        if (!string.Equals(normalizedRequestOrigin, frontendOrigin, StringComparison.OrdinalIgnoreCase))
        {
            throw new CustomException("Dropbox connection request origin is invalid.");
        }
    }

    private static string NormalizeDropboxPath(string? value)
    {
        if (string.IsNullOrWhiteSpace(value) || value == "/")
        {
            return string.Empty;
        }

        var trimmed = value.Trim();
        return trimmed.StartsWith('/') ? trimmed : $"/{trimmed}";
    }

    private static string? GetParentPath(string path)
    {
        if (string.IsNullOrWhiteSpace(path))
        {
            return null;
        }

        var normalized = NormalizeDropboxPath(path).TrimEnd('/');
        var slashIndex = normalized.LastIndexOf('/');
        if (slashIndex <= 0)
        {
            return string.Empty;
        }

        return normalized[..slashIndex];
    }

    private static bool IsSupportedImageName(string name)
    {
        var extension = Path.GetExtension(name);
        return !string.IsNullOrWhiteSpace(extension) && SupportedImageExtensions.Contains(extension);
    }

    private static bool NeedsRefresh(DropboxTokenRecord token)
    {
        return token.AccessTokenExpiresAtUtc.HasValue && token.AccessTokenExpiresAtUtc.Value <= DateTimeOffset.UtcNow.Add(TokenRefreshBuffer);
    }

    private static DropboxTokenRecord ParseDropboxToken(JsonElement root)
    {
        var expiresAt = root.TryGetProperty("expires_in", out var expiresIn) && expiresIn.TryGetInt32(out var seconds)
            ? DateTimeOffset.UtcNow.AddSeconds(seconds)
            : (DateTimeOffset?)null;

        return new DropboxTokenRecord(
            root.TryGetProperty("access_token", out var accessToken) ? accessToken.GetString() ?? string.Empty : string.Empty,
            root.TryGetProperty("refresh_token", out var refreshToken) ? refreshToken.GetString() : null,
            expiresAt,
            root.TryGetProperty("account_id", out var accountId) ? accountId.GetString() : null,
            root.TryGetProperty("scope", out var scope) ? scope.GetString() : null,
            root.TryGetProperty("token_type", out var tokenType) ? tokenType.GetString() : null,
            null);
    }

    private static TripNoteEditorDropboxCallbackResultDto BuildCallbackResult(string frontendOrigin, string frontendPath, bool success, string message)
    {
        return new TripNoteEditorDropboxCallbackResultDto
        {
            RedirectUrl = BuildFrontendReturnUrl(frontendOrigin, frontendPath, success, message),
        };
    }

    private static string BuildFrontendReturnUrl(string frontendOrigin, string frontendPath, bool success, string message)
    {
        var baseUrl = $"{frontendOrigin}{frontendPath}";
        return QueryHelpers.AddQueryString(baseUrl, new Dictionary<string, string?>
        {
            ["dropboxConnect"] = success ? "success" : "error",
            ["dropboxMessage"] = message,
        });
    }

    private static string BuildStatusHtml(bool success, string message)
    {
        var encodedMessage = HtmlEncoder.Default.Encode(message);
        var statusTitle = success ? "Dropbox connected" : "Dropbox authorization failed";

        return "<!DOCTYPE html>\n"
                + "<html lang=\"en\">\n"
                + "<head>\n"
                + "  <meta charset=\"utf-8\" />\n"
                + "  <title>Dropbox Connection</title>\n"
                + "  <style>body{font-family:Segoe UI,Arial,sans-serif;padding:24px;color:#1f2937}h1{font-size:20px;margin:0 0 12px}p{margin:0 0 12px;line-height:1.45}.hint{color:#6b7280;font-size:14px}</style>\n"
                + "</head>\n"
                + "<body>\n"
                + $"  <h1>{HtmlEncoder.Default.Encode(statusTitle)}</h1>\n"
                + $"  <p>{encodedMessage}</p>\n"
                + "  <p class=\"hint\">Return to Plantour and try the Dropbox connection again.</p>\n"
                + "</body>\n"
                + "</html>";
    }

    private sealed record DropboxStatePayload(Guid UserId, Guid AdminId, string FrontendOrigin, string FrontendPath, DateTimeOffset IssuedAt);

    private sealed record DropboxTokenRecord(
        string AccessToken,
        string? RefreshToken,
        DateTimeOffset? AccessTokenExpiresAtUtc,
        string? AccountId,
        string? Scope,
        string? TokenType,
        string? DisplayName);

    private sealed record DropboxAccountRecord(string? AccountId, string? DisplayName);

    private sealed record DropboxBrowserEntry(string Id, string Name, string Path, bool IsFolder, string? PreviewUrl);
}