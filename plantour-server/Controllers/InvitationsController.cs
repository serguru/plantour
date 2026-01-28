using Microsoft.AspNetCore.Mvc;
using plantour_server.Attributes;
using plantour_server.DTOs;
using plantour_server.Services.Interfaces;

namespace plantour_server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InvitationsController : ControllerBase
{
    private readonly IInvitationService _service;

    public InvitationsController(IInvitationService service)
    {
        _service = service;
    }

    [HttpPost("send")]
    [AdminOnly]
    public async Task<ActionResult<SendInvitationResponse>> Send([FromBody] SendInvitationRequest request)
    {
        var result = await _service.SendInvitationAsync(request);
        return Ok(result);
    }
}
