using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using plantour_server.DTOs;
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
    private const string DropboxApiBaseUrl = "https://api.dropboxapi.com/2";
    private const string DropboxSharedDownloadUrl = "https://content.dropboxapi.com/2/sharing/get_shared_link_file";
    private const string DropboxFileDownloadUrl = "https://content.dropboxapi.com/2/files/download";
    private const string DropboxPrivateImageScheme = "plantour-dropbox";

    private readonly KeyRepository _keyRepository = keyRepository;
    private readonly IHttpClientFactory _httpClientFactory = httpClientFactory;
    private readonly CurrentUser _currentUser = httpCurrentUser.CurrentUser;

    public async Task<DropboxBrowseResultDto> BrowseAsync(string? path)
    {
        _currentUser.RaiseIfNotAuthenticated();

        var token = await GetDropboxTokenAsync();
        var normalizedPath = NormalizeBrowsePath(path);
        var client = _httpClientFactory.CreateClient();
        client.Timeout = TimeSpan.FromSeconds(30);

        var entries = await ListFolderEntriesAsync(client, token, normalizedPath);
        return new DropboxBrowseResultDto
        {
            CurrentPath = string.IsNullOrWhiteSpace(normalizedPath) ? null : normalizedPath,
            ParentPath = GetParentPath(normalizedPath),
            Entries = entries
                .Where(entry => entry.Type == "folder" || IsImageFile(entry.Name))
                .OrderBy(entry => entry.Type == "file")
                .ThenBy(entry => entry.Name, StringComparer.OrdinalIgnoreCase)
                .Select(entry => new DropboxBrowseEntryDto
                {
                    Type = entry.Type,
                    Name = entry.Name,
                    PathDisplay = entry.PathDisplay,
                    Id = entry.Id,
                    Source = entry.Type == "file" && !string.IsNullOrWhiteSpace(entry.Id)
                        ? CreatePrivateImageSource(entry.Id, entry.Name)
                        : null,
                })
                .ToList(),
        };
    }

    public async Task<DropboxImageDownloadResult?> TryDownloadImageAsync(string source)
    {
        if (IsDropboxPrivateImageSource(source))
        {
            return await TryDownloadPrivateImageAsync(source);
        }

        return await TryDownloadImageBySharedLinkAsync(source);
    }

    private async Task<DropboxImageDownloadResult?> TryDownloadImageBySharedLinkAsync(string sharedLink)
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

    private async Task<DropboxImageDownloadResult?> TryDownloadPrivateImageAsync(string source)
    {
        if (!TryParsePrivateImageSource(source, out var reference))
        {
            return null;
        }

        _currentUser.RaiseIfNotAuthenticated();

        var token = await GetDropboxTokenAsync();
        using var request = new HttpRequestMessage(HttpMethod.Post, DropboxFileDownloadUrl);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        request.Headers.Add("Dropbox-API-Arg", JsonSerializer.Serialize(new { path = reference!.FileId }));

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

        var fileName = TryGetFileName(response) ?? reference.FileName ?? "dropbox-image";
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

    public static string CreatePrivateImageSource(string fileId, string fileName)
    {
        return $"{DropboxPrivateImageScheme}://file?id={Uri.EscapeDataString(fileId)}&name={Uri.EscapeDataString(fileName)}";
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

    public static bool IsDropboxImageSource(string? value)
    {
        return IsDropboxSharedLink(value) || IsDropboxPrivateImageSource(value);
    }

    public static bool IsDropboxPrivateImageSource(string? value)
    {
        return TryParsePrivateImageSource(value, out _);
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

    private async Task<List<DropboxListEntry>> ListFolderEntriesAsync(HttpClient client, string token, string normalizedPath)
    {
        using var request = CreateDropboxJsonRequest($"{DropboxApiBaseUrl}/files/list_folder", token, new
        {
            path = normalizedPath,
            recursive = false,
            include_deleted = false,
            include_mounted_folders = true,
            include_non_downloadable_files = false,
        });

        using var response = await client.SendAsync(request);
        if (!response.IsSuccessStatusCode)
        {
            throw new CustomException("Unable to browse Dropbox files. Ensure your Dropbox token is active and includes files.metadata.read and files.content.read scopes.");
        }

        using var document = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync());
        var result = ParseListFolderResponse(document.RootElement);

        var entries = new List<DropboxListEntry>(result.Entries);
        var cursor = result.Cursor;
        while (result.HasMore && !string.IsNullOrWhiteSpace(cursor))
        {
            using var continueRequest = CreateDropboxJsonRequest($"{DropboxApiBaseUrl}/files/list_folder/continue", token, new { cursor });
            using var continueResponse = await client.SendAsync(continueRequest);
            if (!continueResponse.IsSuccessStatusCode)
            {
                throw new CustomException("Unable to browse Dropbox files. Ensure your Dropbox token is active and includes files.metadata.read and files.content.read scopes.");
            }

            using var continueDocument = await JsonDocument.ParseAsync(await continueResponse.Content.ReadAsStreamAsync());
            result = ParseListFolderResponse(continueDocument.RootElement);
            entries.AddRange(result.Entries);
            cursor = result.Cursor;
        }

        return entries;
    }

    private static HttpRequestMessage CreateDropboxJsonRequest(string url, string token, object payload)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, url);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        request.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
        return request;
    }

    private static DropboxListFolderResponse ParseListFolderResponse(JsonElement root)
    {
        var entries = new List<DropboxListEntry>();
        if (root.TryGetProperty("entries", out var entriesElement) && entriesElement.ValueKind == JsonValueKind.Array)
        {
            foreach (var entry in entriesElement.EnumerateArray())
            {
                var type = entry.TryGetProperty(".tag", out var tag) && tag.ValueKind == JsonValueKind.String
                    ? tag.GetString()
                    : null;

                var name = entry.TryGetProperty("name", out var nameProp) && nameProp.ValueKind == JsonValueKind.String
                    ? nameProp.GetString()
                    : null;

                if (string.IsNullOrWhiteSpace(type) || string.IsNullOrWhiteSpace(name))
                {
                    continue;
                }

                entries.Add(new DropboxListEntry(
                    type,
                    name,
                    entry.TryGetProperty("path_display", out var pathDisplay) && pathDisplay.ValueKind == JsonValueKind.String ? pathDisplay.GetString() : null,
                    entry.TryGetProperty("id", out var id) && id.ValueKind == JsonValueKind.String ? id.GetString() : null));
            }
        }

        return new DropboxListFolderResponse(
            entries,
            root.TryGetProperty("cursor", out var cursorProp) && cursorProp.ValueKind == JsonValueKind.String ? cursorProp.GetString() : null,
            root.TryGetProperty("has_more", out var hasMoreProp) && hasMoreProp.ValueKind == JsonValueKind.True);
    }

    private static string NormalizeBrowsePath(string? path)
    {
        if (string.IsNullOrWhiteSpace(path) || path == "/")
        {
            return string.Empty;
        }

        var normalized = path.Trim();
        if (!normalized.StartsWith('/'))
        {
            normalized = "/" + normalized;
        }

        return normalized;
    }

    private static string? GetParentPath(string normalizedPath)
    {
        if (string.IsNullOrWhiteSpace(normalizedPath) || normalizedPath == "/")
        {
            return null;
        }

        var lastSlashIndex = normalizedPath.LastIndexOf('/');
        if (lastSlashIndex <= 0)
        {
            return null;
        }

        return normalizedPath[..lastSlashIndex];
    }

    private static bool IsImageFile(string? fileName)
    {
        var extension = Path.GetExtension(fileName)?.ToLowerInvariant();
        return extension is ".jpg" or ".jpeg" or ".png" or ".gif" or ".webp" or ".bmp" or ".svg" or ".tif" or ".tiff" or ".avif";
    }

    private static bool TryParsePrivateImageSource(string? value, out DropboxPrivateImageReference? reference)
    {
        reference = default;

        if (string.IsNullOrWhiteSpace(value) || !Uri.TryCreate(value, UriKind.Absolute, out var uri))
        {
            return false;
        }

        if (!string.Equals(uri.Scheme, DropboxPrivateImageScheme, StringComparison.OrdinalIgnoreCase)
            || !string.Equals(uri.Host, "file", StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        var queryValues = ParseQuery(uri.Query);
        if (!queryValues.TryGetValue("id", out var fileId) || string.IsNullOrWhiteSpace(fileId))
        {
            return false;
        }

        queryValues.TryGetValue("name", out var fileName);
        reference = new DropboxPrivateImageReference(fileId, fileName);
        return true;
    }

    private static Dictionary<string, string> ParseQuery(string query)
    {
        var result = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        if (string.IsNullOrWhiteSpace(query))
        {
            return result;
        }

        foreach (var part in query.TrimStart('?').Split('&', StringSplitOptions.RemoveEmptyEntries))
        {
            var split = part.Split('=', 2);
            var key = Uri.UnescapeDataString(split[0]);
            var value = split.Length > 1 ? Uri.UnescapeDataString(split[1]) : string.Empty;
            result[key] = value;
        }

        return result;
    }

    private sealed record DropboxListFolderResponse(List<DropboxListEntry> Entries, string? Cursor, bool HasMore);

    private sealed record DropboxListEntry(string Type, string Name, string? PathDisplay, string? Id);

    private sealed record DropboxPrivateImageReference(string FileId, string? FileName);
}