using plantour_server.DTOs;

namespace plantour_server.Services;

public interface ITripNoteEditorService
{
    Task<TripNoteEditorConfigDto> GetConfigAsync();
    Task<TripNoteEditorDropboxConnectUrlDto> CreateDropboxConnectUrlAsync(TripNoteEditorDropboxConnectUrlRequest request);
    Task<TripNoteEditorDropboxCallbackResultDto> CompleteDropboxAuthorizationAsync(string? code, string? state, string? error, string? errorDescription);
    Task DisconnectDropboxAsync();
    Task<TripNoteEditorDropboxBrowserDto> BrowseDropboxAsync(TripNoteEditorDropboxBrowseRequest request);
    Task<TripNoteEditorResolvedDropboxImagesDto> ResolveDropboxImagesAsync(TripNoteEditorResolveDropboxImagesRequest request);
    Task<Dictionary<string, string>> ResolveDropboxTemporaryLinksAsync(IEnumerable<string> paths);
}