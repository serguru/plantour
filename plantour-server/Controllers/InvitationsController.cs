using Microsoft.AspNetCore.Mvc;
using plantour_server.Attributes;
using plantour_server.DTOs;
using plantour_server.Services.Interfaces;
using plantour_server.Models;

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
    public async Task<ActionResult<SendInvitationEmailResponse>> Send([FromBody] SendInvitationEmailRequest request)
    {
        var result = await _service.SendInvitationEmailAsync(request);
        return Ok(result);
    }
}
