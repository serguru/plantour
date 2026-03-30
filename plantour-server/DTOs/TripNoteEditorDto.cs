using System.Text.Json.Serialization;

namespace plantour_server.DTOs;

public class TripNoteEditorConfigDto
{
    [JsonPropertyName("tinyMceApiKey")]
    public string TinyMceApiKey { get; set; } = "no-api-key";

    [JsonPropertyName("dropboxEnabled")]
    public bool DropboxEnabled { get; set; }

    [JsonPropertyName("dropboxConnected")]
    public bool DropboxConnected { get; set; }

    [JsonPropertyName("dropboxDisplayName")]
    public string? DropboxDisplayName { get; set; }
}

public class TripNoteEditorDropboxConnectUrlRequest
{
    [JsonPropertyName("frontendOrigin")]
    public string FrontendOrigin { get; set; } = null!;
}

public class TripNoteEditorDropboxConnectUrlDto
{
    [JsonPropertyName("authorizationUrl")]
    public string AuthorizationUrl { get; set; } = null!;

    [JsonPropertyName("redirectUri")]
    public string RedirectUri { get; set; } = null!;
}

public class TripNoteEditorDropboxBrowseRequest
{
    [JsonPropertyName("path")]
    public string? Path { get; set; }
}

public class TripNoteEditorDropboxBrowserDto
{
    [JsonPropertyName("currentPath")]
    public string CurrentPath { get; set; } = string.Empty;

    [JsonPropertyName("parentPath")]
    public string? ParentPath { get; set; }

    [JsonPropertyName("entries")]
    public IReadOnlyList<TripNoteEditorDropboxBrowserEntryDto> Entries { get; set; } = [];
}

public class TripNoteEditorDropboxBrowserEntryDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = null!;

    [JsonPropertyName("name")]
    public string Name { get; set; } = null!;

    [JsonPropertyName("path")]
    public string Path { get; set; } = null!;

    [JsonPropertyName("isFolder")]
    public bool IsFolder { get; set; }

    [JsonPropertyName("previewUrl")]
    public string? PreviewUrl { get; set; }
}

public class TripNoteEditorResolveDropboxImagesRequest
{
    [JsonPropertyName("paths")]
    public IReadOnlyList<string> Paths { get; set; } = [];
}

public class TripNoteEditorResolvedDropboxImagesDto
{
    [JsonPropertyName("images")]
    public IReadOnlyList<TripNoteEditorResolvedDropboxImageDto> Images { get; set; } = [];
}

public class TripNoteEditorResolvedDropboxImageDto
{
    [JsonPropertyName("path")]
    public string Path { get; set; } = null!;

    [JsonPropertyName("url")]
    public string Url { get; set; } = null!;
}