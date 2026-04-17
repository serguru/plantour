using Microsoft.AspNetCore.Mvc;
using plantour_server.Attributes;
using plantour_server.Models;
using plantour_server.Services;
using PlantourApi.Middleware;
using PlantourApi.Models;

namespace plantour_server.Controllers;

[ApiController]
[Route("payment-processor")]
[Route("paddle")]
public class PaymentProcessorController : ControllerBase
{
    private readonly IPaymentProcessorService _service;
    private readonly CurrentUser _currentUser;

    public PaymentProcessorController(IPaymentProcessorService service, HttpCurrentUser httpCurrentUser)
    {
        _service = service;
        _currentUser = httpCurrentUser.CurrentUser;
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

    [HttpGet("customer-exists")]
    public async Task<ActionResult<bool>> CustomerExists([FromQuery] string email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            return BadRequest("Email is required");
        }

        var customerId = await _service.GetActiveCustomerIdByEmailAsync(email);
        return Ok(!string.IsNullOrWhiteSpace(customerId));
    }

    [HttpPost]
    public async Task<ActionResult> GetSubscriptionId([FromBody] PaymentProcessorSubscriptionIdRequest request)
    {
        var subscriptionId = await _service.GetActiveSubscriptionIdAsync(request);
        return Ok(subscriptionId);
    }

    [HttpPost("checkout-session")]
    public async Task<ActionResult<PaymentProcessorCheckoutResponse>> CreateCheckoutSession([FromBody] PaymentProcessorCheckoutRequest request)
    {
        var response = await _service.CreateCheckoutSessionAsync(request);
        return Ok(response);
    }

    [HttpPost("customer-portal-session")]
    [AdminOnly]
    public async Task<ActionResult<PortalSessionResponse>> CreateCustomerPortalSession()
    {
        var response = await _service.CreateCustomerPortalSessionAsync();
        return Ok(response);
    }

    [HttpGet("current-billing-period-end")]
    [AdminOnly]
    public async Task<ActionResult<object>> GetCurrentBillingPeriodEnd()
    {
        var subscription = await _service.GetActiveSubscriptionByUserIdAsync(_currentUser.UserId, UserRole.Admin, _currentUser.UserId);
        return Ok(new { billingPeriodEnd = subscription?.BillingPeriodEnd });
    }
}