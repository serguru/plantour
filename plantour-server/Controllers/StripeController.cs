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
    private readonly IStripeService _stripeService;
    private readonly StripeSettings _stripeSettings;
    private readonly ILogger<StripeController> _logger;
    private readonly IStripeWebhookService _webhookService;
    private readonly string _webhookSecret;
    private readonly IConfiguration _configuration;

    public StripeController(
        IStripeService stripeService,
        IOptions<StripeSettings> stripeSettings,
        ILogger<StripeController> logger,
        IStripeWebhookService webhookService,
        IConfiguration configuration
        )
    {
        _logger = logger;
        _stripeService = stripeService;
        _stripeSettings = stripeSettings.Value;
        _webhookService = webhookService;
        _webhookSecret = configuration["StripeSettings:WebhookSigningSecret"]!;
        _configuration = configuration;
    }

    [HttpGet]
    [AdminOnly]
    [Route("create-portal-session")]
    public async Task<ActionResult<PortalSessionResponse>> CreatePortalSession()
    {
        var result = await _stripeService.CreatePortalSession();

        return Ok(result);
    }

    [HttpPost]
    [Route("webhook")]
    public async Task<IActionResult> HandleWebhook()
    {
        var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();

        var stripeEvent = EventUtility.ConstructEvent(
            json,
            Request.Headers["Stripe-Signature"],
            _webhookSecret
        );

        await _webhookService.ProcessStripeEventAsync(stripeEvent);

        return Ok();
    }


    // Create checkout session for subscription
    [HttpPost("create-checkout-session")]
    public async Task<IActionResult> CreateCheckoutSession()
    {
        var session = await _stripeService.CreateCheckoutSession();
        return Ok(new { sessionId = session.Id, url = session.Url });
    }

}