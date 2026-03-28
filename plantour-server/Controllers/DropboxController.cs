using Microsoft.AspNetCore.Mvc;
using plantour_server.Attributes;
using plantour_server.Services.Interfaces;

namespace plantour_server.Controllers;

[ApiController]
[Route("[controller]")]
public class DropboxController(IDropboxService dropboxService) : ControllerBase
{
    private readonly IDropboxService _dropboxService = dropboxService;

    [HttpGet("image")]
    [AdminOrParticipant]
    public async Task<IActionResult> GetImage([FromQuery] string url)
    {
        var result = await _dropboxService.TryDownloadImageBySharedLinkAsync(url);
        if (result == null)
        {
            return NotFound();
        }

        return File(result.Bytes, result.ContentType, enableRangeProcessing: false);
    }
}

