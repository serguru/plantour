namespace plantour_server.Models;

public class TripNoteEditorSettings
{
    public string TinyMceApiKey { get; set; } = "no-api-key";
    public string DropboxAppKey { get; set; } = string.Empty;
    public string DropboxAppSecret { get; set; } = string.Empty;
    public string DropboxRedirectUri { get; set; } = string.Empty;
}