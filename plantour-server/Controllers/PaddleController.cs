using Microsoft.AspNetCore.Mvc;
using plantour_server.Attributes;
using plantour_server.DTOs;
using plantour_server.Models;
using plantour_server.Services;

namespace plantour_server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaddleController : ControllerBase
{
    private readonly IPaddleService _service;

    public PaddleController(IPaddleService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<ActionResult> GetSubscriptionId([FromBody] PaddleSubscriptionIdRequest request)
    {
        var subscriptionId = await _service.GetSubscriptionIdAsync(request);
        return Ok(subscriptionId);
    }
}
