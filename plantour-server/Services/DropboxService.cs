using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using plantour_server.Repositories;
using plantour_server.Services.Interfaces;
using PlantourApi.Middleware;
using PlantourApi.Models;

namespace plantour_server.Services;

public class DropboxService(
    KeyRepository keyRepository,
    IHttpClientFactory httpClientFactory,
    HttpCurrentUser httpCurrentUser) : IDropboxService
{
    private const string DropboxKeyName = "dropbox";
    private const string DropboxSharedDownloadUrl = "https://content.dropboxapi.com/2/sharing/get_shared_link_file";

    private readonly KeyRepository _keyRepository = keyRepository;
    private readonly IHttpClientFactory _httpClientFactory = httpClientFactory;
    private readonly CurrentUser _currentUser = httpCurrentUser.CurrentUser;

    public async Task<DropboxImageDownloadResult?> TryDownloadImageBySharedLinkAsync(string sharedLink)
    {
        if (!IsDropboxSharedLink(sharedLink))
        {
            return null;
        }

        _currentUser.RaiseIfNotAuthenticated();

        var token = await GetDropboxTokenAsync();
        using var request = new HttpRequestMessage(HttpMethod.Post, DropboxSharedDownloadUrl);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        request.Headers.Add("Dropbox-API-Arg", JsonSerializer.Serialize(new { url = sharedLink }));

        var client = _httpClientFactory.CreateClient();
        client.Timeout = TimeSpan.FromSeconds(30);

        using var response = await client.SendAsync(request);
        if (!response.IsSuccessStatusCode)
        {
            return null;
        }

        var bytes = await response.Content.ReadAsByteArrayAsync();
        if (bytes.Length == 0)
        {
            return null;
        }

        var fileName = TryGetFileName(response) ?? ExtractFileNameFromUrl(sharedLink) ?? "dropbox-image";
        var reportedContentType = response.Content.Headers.ContentType?.MediaType;
        var contentType = ResolveImageContentType(reportedContentType, fileName, bytes);
        if (contentType == null)
        {
            return null;
        }

        return new DropboxImageDownloadResult(bytes, contentType, fileName);
    }

    private async Task<string> GetDropboxTokenAsync()
    {
        var key = await _keyRepository.GetByNameAsync(_currentUser.UserId, DropboxKeyName);
        if (key == null || !key.Active || string.IsNullOrWhiteSpace(key.Key))
        {
            throw new CustomException("Active 'dropbox' key not found. Add your Dropbox access token in Keys first.");
        }

        var token = key.Key.Trim();
        if (token.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            token = token[7..].Trim();
        }

        return token;
    }

    private static string? TryGetFileName(HttpResponseMessage response)
    {
        if (!response.Headers.TryGetValues("Dropbox-API-Result", out var values))
        {
            return null;
        }

        var raw = values.FirstOrDefault();
        if (string.IsNullOrWhiteSpace(raw))
        {
            return null;
        }

        try
        {
            using var document = JsonDocument.Parse(raw);
            return document.RootElement.TryGetProperty("name", out var nameProp) && nameProp.ValueKind == JsonValueKind.String
                ? nameProp.GetString()
                : null;
        }
        catch
        {
            return null;
        }
    }

    private static string? ExtractFileNameFromUrl(string value)
    {
        if (!Uri.TryCreate(value, UriKind.Absolute, out var uri))
        {
            return null;
        }

        var lastSegment = uri.AbsolutePath.Split('/', StringSplitOptions.RemoveEmptyEntries).LastOrDefault();
        return string.IsNullOrWhiteSpace(lastSegment) ? null : Uri.UnescapeDataString(lastSegment);
    }

    private static string? ResolveImageContentType(string? reportedContentType, string fileName, byte[] bytes)
    {
        if (!string.IsNullOrWhiteSpace(reportedContentType)
            && reportedContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
        {
            return reportedContentType;
        }

        return TryGetImageContentTypeFromFileName(fileName)
            ?? TryGetImageContentTypeFromBytes(bytes);
    }

    private static string? TryGetImageContentTypeFromFileName(string? fileName)
    {
        var extension = Path.GetExtension(fileName)?.ToLowerInvariant();
        return extension switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".gif" => "image/gif",
            ".webp" => "image/webp",
            ".bmp" => "image/bmp",
            ".svg" => "image/svg+xml",
            ".tif" or ".tiff" => "image/tiff",
            ".avif" => "image/avif",
            _ => null,
        };
    }

    private static string? TryGetImageContentTypeFromBytes(byte[] bytes)
    {
        if (bytes.Length >= 3
            && bytes[0] == 0xFF
            && bytes[1] == 0xD8
            && bytes[2] == 0xFF)
        {
            return "image/jpeg";
        }

        if (bytes.Length >= 8
            && bytes[0] == 0x89
            && bytes[1] == 0x50
            && bytes[2] == 0x4E
            && bytes[3] == 0x47
            && bytes[4] == 0x0D
            && bytes[5] == 0x0A
            && bytes[6] == 0x1A
            && bytes[7] == 0x0A)
        {
            return "image/png";
        }

        if (bytes.Length >= 6)
        {
            var prefix = Encoding.ASCII.GetString(bytes, 0, 6);
            if (prefix is "GIF87a" or "GIF89a")
            {
                return "image/gif";
            }
        }

        if (bytes.Length >= 12
            && Encoding.ASCII.GetString(bytes, 0, 4) == "RIFF"
            && Encoding.ASCII.GetString(bytes, 8, 4) == "WEBP")
        {
            return "image/webp";
        }

        if (bytes.Length >= 2
            && bytes[0] == 0x42
            && bytes[1] == 0x4D)
        {
            return "image/bmp";
        }

        return null;
    }

    public static bool IsDropboxSharedLink(string? value)
    {
        if (string.IsNullOrWhiteSpace(value) || !Uri.TryCreate(value, UriKind.Absolute, out var uri))
        {
            return false;
        }

        if (uri.Scheme != Uri.UriSchemeHttps)
        {
            return false;
        }

        var host = uri.Host.ToLowerInvariant();
        if (host != "dropbox.com" && host != "www.dropbox.com")
        {
            return false;
        }

        var path = uri.AbsolutePath;
        return path.Contains("/s/", StringComparison.OrdinalIgnoreCase)
            || path.Contains("/scl/", StringComparison.OrdinalIgnoreCase);
    }
}