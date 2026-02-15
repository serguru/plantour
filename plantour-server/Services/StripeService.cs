using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Models;
using plantour_server.Repositories;
using plantour_server.Utils;
using PlantourApi.Middleware;
using PlantourApi.Models;
using Stripe;

namespace plantour_server.Services;

public class StripeService(
    HttpCurrentUser httpCurrentUser,
    IConfiguration configuration
    ): IStripeService
{
    private readonly CurrentUser _currentUser = httpCurrentUser.CurrentUser;
    private readonly IConfiguration _configuration = configuration;

    public async Task<PortalSessionResponse> CreatePortalSession()
    {
        StripeConfiguration.ApiKey = _configuration["StripeSettings:SecretKey"] ?? throw new CustomException("Stripe secret key is not configured");

        _currentUser.RaiseIfNotAuthenticated();

        var stripeCustomerId = _currentUser.StripeCustomerId ?? throw new CustomException("User does not have a Stripe customer Id");

        // Create the portal session
        var options = new Stripe.BillingPortal.SessionCreateOptions
        {
            Customer = stripeCustomerId,
            ReturnUrl = $"{_configuration["PlantourAppOrigin"]}/profile"
        };

        var service = new Stripe.BillingPortal.SessionService();
        var session = await service.CreateAsync(options);

        return new PortalSessionResponse { Url = session.Url };
    }

}
