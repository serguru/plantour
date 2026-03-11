using Microsoft.AspNetCore.Mvc;
using plantour_server.Attributes;
using plantour_server.DTOs;
using plantour_server.Models;
using plantour_server.Services;
// TODO: check upgrade from the starter to a paid plan
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

    [HttpGet("active-subscription-exists")]
    public async Task<ActionResult<bool>> ActiveSubscriptionExists([FromQuery] string email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            return BadRequest("Email is required");
        }

        var activeExists = await _service.ActiveSubscriptionExists(email);
        return Ok(activeExists);
    }

    [HttpPost]
    public async Task<ActionResult> GetSubscriptionId([FromBody] PaddleSubscriptionIdRequest request)
    {
        var subscriptionId = await _service.GetActiveSubscriptionIdAsync(request);
        return Ok(subscriptionId);
    }

    [HttpPost("customer-portal-session")]
    [AdminOnly]
    public async Task<ActionResult<PortalSessionResponse>> CreateCustomerPortalSession()
    {
        var response = await _service.CreateCustomerPortalSessionAsync();
        return Ok(response);
    }
}
