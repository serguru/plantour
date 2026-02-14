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

    [HttpPost("webhook")]
    public async Task<ActionResult<object>> Send()
    {
        var payload = await new StreamReader(Request.Body).ReadToEndAsync();
        var signatureHeader = Request.Headers["Stripe-Signature"].ToString();

        if (string.IsNullOrWhiteSpace(_stripeSettings.WebhookSigningSecret))
        {
            return Problem(
                detail: "Stripe webhook signing secret is not configured (StripeSettings:WebhookSigningSecret).",
                statusCode: StatusCodes.Status500InternalServerError);
        }

        Event stripeEvent;

        try
        {
            stripeEvent = EventUtility.ConstructEvent(
                payload,
                signatureHeader,
                _stripeSettings.WebhookSigningSecret);
        }
        catch (StripeException ex)
        {
            return BadRequest(new
            {
                error = "Invalid Stripe webhook signature or payload",
                message = ex.Message
            });
        }

        // TODO (Phase 4): route by stripeEvent.Type and update Plantour billing state.
        // For now, we only acknowledge receipt.
        return Ok(new { received = true, stripeEvent.Id, stripeEvent.Type });
    }
}
