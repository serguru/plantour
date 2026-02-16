using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using Stripe;
using System.IO;
using System.Threading.Tasks;
using plantour_server.Services;

namespace plantour_server.Controllers;

[Route("api/[controller]")]
[ApiController]
public class StripeWebhookController : ControllerBase
{
    private readonly ILogger<StripeWebhookController> _logger;
    private readonly IStripeWebhookService _webhookService;
    private readonly string _webhookSecret;

    public StripeWebhookController(
        ILogger<StripeWebhookController> logger,
        IStripeWebhookService webhookService,
        IConfiguration configuration)
    {
        _logger = logger;
        _webhookService = webhookService;
        _webhookSecret = configuration["StripeSettings:WebhookSigningSecret"]!;
    }

    [HttpPost]
    public async Task<IActionResult> HandleWebhook()
    {
        var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();

        try
        {
            var stripeEvent = EventUtility.ConstructEvent(
                json,
                Request.Headers["Stripe-Signature"],
                _webhookSecret
            );

            _logger.LogInformation($"Received Stripe webhook: {stripeEvent.Type}");
            await _webhookService.ProcessStripeEventAsync(stripeEvent);

            return Ok();
        }
        catch (StripeException e)
        {
            _logger.LogError(e, "Error processing Stripe webhook");
            return BadRequest();
        }
    }
}
