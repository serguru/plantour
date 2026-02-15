using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Models;

namespace plantour_server.Services;

public interface IStripeService
{
    // Task<string> CreateCheckoutSessionAsync(Guid customerId, string priceId, string successUrl, string cancelUrl);
    // Task<CustomerSubscription> CreateSubscriptionAsync(Guid customerId, string priceId);
    // Task<CustomerSubscription> UpdateSubscriptionAsync(string subscriptionId, string newPriceId);
    // Task CancelSubscriptionAsync(string subscriptionId, bool cancelAtPeriodEnd = true);
    // Task<List<Stripe.Price>> GetPricesAsync();

    Task<PortalSessionResponse> CreatePortalSession();
}
