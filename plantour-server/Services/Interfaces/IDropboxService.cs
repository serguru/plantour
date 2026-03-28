using plantour_server.DTOs;

namespace plantour_server.Services.Interfaces;

public interface IDropboxService
{
    Task<DropboxBrowseResultDto> BrowseAsync(string? path);
    Task<DropboxImageDownloadResult?> TryDownloadImageAsync(string source);
}

public record DropboxImageDownloadResult(byte[] Bytes, string ContentType, string FileName);