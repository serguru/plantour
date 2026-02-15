using Microsoft.AspNetCore.Mvc;
using plantour_server.Attributes;
using plantour_server.DTOs;
using plantour_server.Services.Interfaces;
using plantour_server.Models;
using plantour_server.Services;
using Microsoft.Extensions.Options;
using Stripe;

namespace plantour_server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StripeController : ControllerBase
{
    private readonly IStripeService _service;
    private readonly StripeSettings _stripeSettings;

    public StripeController(IStripeService service, IOptions<StripeSettings> stripeSettings)
    {
        _service = service;
        _stripeSettings = stripeSettings.Value;
    }

    [HttpGet]
    [AdminOnly]
    [Route("create-portal-session")]
    public async Task<ActionResult<PortalSessionResponse>> CreatePortalSession()
    {
        var result = await _service.CreatePortalSession();

        return Ok(result);
    }


}
