namespace plantour_server.Services.Interfaces;

public interface IDropboxService
{
    Task<DropboxImageDownloadResult?> TryDownloadImageBySharedLinkAsync(string sharedLink);
}

public record DropboxImageDownloadResult(byte[] Bytes, string ContentType, string FileName);