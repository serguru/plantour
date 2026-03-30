using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using plantour_server.Attributes;
using plantour_server.DTOs;
using plantour_server.Services;

namespace plantour_server.Controllers;

[ApiController]
[Route("trip-note-editor")]
public class TripNoteEditorController(ITripNoteEditorService service) : ControllerBase
{
    private readonly ITripNoteEditorService _service = service;

    [HttpGet("config")]
    [AdminOrParticipant]
    public async Task<ActionResult<TripNoteEditorConfigDto>> GetConfig()
    {
        return Ok(await _service.GetConfigAsync());
    }

    [HttpPost("dropbox/connect-url")]
    [AdminOrParticipant]
    public async Task<ActionResult<TripNoteEditorDropboxConnectUrlDto>> CreateDropboxConnectUrl([FromBody] TripNoteEditorDropboxConnectUrlRequest request)
    {
        return Ok(await _service.CreateDropboxConnectUrlAsync(request));
    }

    [HttpGet("dropbox/callback")]
    [AllowAnonymous]
    public async Task<IActionResult> CompleteDropboxAuthorization([FromQuery] string? code, [FromQuery] string? state, [FromQuery] string? error, [FromQuery(Name = "error_description")] string? errorDescription)
    {
        var result = await _service.CompleteDropboxAuthorizationAsync(code, state, error, errorDescription);
        if (!string.IsNullOrWhiteSpace(result.RedirectUrl))
        {
            return Redirect(result.RedirectUrl);
        }

        return Content(result.Html ?? "Dropbox authorization failed.", "text/html");
    }

    [HttpDelete("dropbox/connection")]
    [AdminOrParticipant]
    public async Task<ActionResult> DisconnectDropbox()
    {
        await _service.DisconnectDropboxAsync();
        return NoContent();
    }

    [HttpPost("dropbox/browse")]
    [AdminOrParticipant]
    public async Task<ActionResult<TripNoteEditorDropboxBrowserDto>> BrowseDropbox([FromBody] TripNoteEditorDropboxBrowseRequest request)
    {
        return Ok(await _service.BrowseDropboxAsync(request));
    }

    [HttpPost("dropbox/resolve-images")]
    [AdminOrParticipant]
    public async Task<ActionResult<TripNoteEditorResolvedDropboxImagesDto>> ResolveDropboxImages([FromBody] TripNoteEditorResolveDropboxImagesRequest request)
    {
        return Ok(await _service.ResolveDropboxImagesAsync(request));
    }
}