using Microsoft.AspNetCore.Mvc;
using plantour_server.Attributes;
using plantour_server.DTOs;
using plantour_server.Services.Interfaces;

namespace plantour_server.Controllers;

[ApiController]
[Route("[controller]")]
public class DropboxController(IDropboxService dropboxService) : ControllerBase
{
    private readonly IDropboxService _dropboxService = dropboxService;

    [HttpGet("browse")]
    [AdminOrParticipant]
    public async Task<ActionResult<DropboxBrowseResultDto>> Browse([FromQuery] string? path)
    {
        return Ok(await _dropboxService.BrowseAsync(path));
    }

    [HttpGet("image")]
    [AdminOrParticipant]
    public async Task<IActionResult> GetImage([FromQuery] string? source, [FromQuery] string? url)
    {
        var imageSource = string.IsNullOrWhiteSpace(source) ? url : source;
        if (string.IsNullOrWhiteSpace(imageSource))
        {
            return BadRequest();
        }

        var result = await _dropboxService.TryDownloadImageAsync(imageSource);
        if (result == null)
        {
            return NotFound();
        }

        return File(result.Bytes, result.ContentType, enableRangeProcessing: false);
    }
}

