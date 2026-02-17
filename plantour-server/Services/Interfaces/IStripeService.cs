using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Models;
using Stripe.Checkout;

namespace plantour_server.Services;

public interface IStripeService
{
    Task<Session> CreateCheckoutSession();
    Task<PortalSessionResponse> CreatePortalSession();
}
