using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Models;
using plantour_server.Repositories;
using plantour_server.Utils;
using PlantourApi.Middleware;
using PlantourApi.Models;
using Stripe;
using Stripe.Checkout;

namespace plantour_server.Services;

public class StripeService(
    HttpCurrentUser httpCurrentUser,
    IConfiguration configuration,
    SettingsRepository settingsRepository
    ) : IStripeService
{
    private readonly CurrentUser _currentUser = httpCurrentUser.CurrentUser;
    private readonly IConfiguration _configuration = configuration;
    private readonly SettingsRepository _settingsRepository = settingsRepository;

    public async Task<PortalSessionResponse> CreatePortalSession()
    {
        StripeConfiguration.ApiKey = _configuration["StripeSettings:SecretKey"] ?? throw new CustomException("Stripe secret key is not configured");

        _currentUser.RaiseIfNotAuthenticated();

        var stripeCustomerId = _currentUser.StripeCustomerId ?? throw new CustomException("User does not have a Stripe customer Id");

        var baseUrl = _settingsRepository.GetSettingByKey("plantour_app_origin").Result.ToString() ?? throw new CustomException("Plantour app origin is not configured");


        // Create the portal session
        var options = new Stripe.BillingPortal.SessionCreateOptions
        {
            Customer = stripeCustomerId,
            ReturnUrl = $"{baseUrl}/profile"
        };

        var service = new Stripe.BillingPortal.SessionService();
        var session = await service.CreateAsync(options);

        return new PortalSessionResponse { Url = session.Url };
    }

    public async Task<Session> CreateCheckoutSession()
    {
        StripeConfiguration.ApiKey = _configuration["StripeSettings:SecretKey"] ?? throw new CustomException("Stripe secret key is not configured");

        string base_month_price_id = _settingsRepository.GetSettingByKey("base_month_price_id").Result.ToString() ?? throw new CustomException("Base month price ID is not configured");
        string base_year_price_id = _settingsRepository.GetSettingByKey("base_year_price_id").Result.ToString() ?? throw new CustomException("Base year price ID is not configured");
        string pro_month_price_id = _settingsRepository.GetSettingByKey("pro_month_price_id").Result.ToString() ?? throw new CustomException("Pro month price ID is not configured");
        string pro_year_price_id = _settingsRepository.GetSettingByKey("pro_year_price_id").Result.ToString() ?? throw new CustomException("Pro year price ID is not configured");

        string checkout_session_success_url = _settingsRepository.GetSettingByKey("checkout_session_success_url").Result.ToString() ?? throw new CustomException("Checkout session success URL is not configured");

        string checkout_session_cancel_url = _settingsRepository.GetSettingByKey("checkout_session_cancel_url").Result.ToString() ?? throw new CustomException("Checkout session cancel URL is not configured");

        string plantour_app_origin = _settingsRepository.GetSettingByKey("plantour_app_origin").Result.ToString() ?? throw new CustomException("Plantour app origin is not configured");

        var options = new SessionCreateOptions
        {
            PaymentMethodTypes = new List<string> { "card" },
            Mode = "subscription",
            LineItems = new List<SessionLineItemOptions>
            {
                new SessionLineItemOptions
                {
                    Price = base_month_price_id,
                    Quantity = 1,
                },
                // new SessionLineItemOptions
                // {
                //     Price = base_year_price_id,
                //     Quantity = 1,
                // },
                new SessionLineItemOptions
                {
                    Price = pro_month_price_id,
                    Quantity = 1,
                },
                // new SessionLineItemOptions
                // {
                //     Price = pro_year_price_id,
                //     Quantity = 1,
                // }
            },
            SuccessUrl = $"{plantour_app_origin}/{checkout_session_success_url}?session_id={{CHECKOUT_SESSION_ID}}",
            CancelUrl = $"{plantour_app_origin}/{checkout_session_cancel_url}",
            AllowPromotionCodes = true
        };

        var service = new SessionService();
        var session = await service.CreateAsync(options);
        return session;
    }


    // public async Task<Session> CreateCheckoutSession()
    // {
    //     StripeConfiguration.ApiKey = _configuration["StripeSettings:SecretKey"] ?? throw new CustomException("Stripe secret key is not configured");

    //     // Get the app origin and redirect URLs
    //     string plantour_app_origin = _settingsRepository.GetSettingByKey("plantour_app_origin").Result.ToString()
    //         ?? throw new CustomException("Plantour app origin is not configured");
    //     string checkout_session_success_url = _settingsRepository.GetSettingByKey("checkout_session_success_url").Result.ToString()
    //         ?? throw new CustomException("Checkout session success URL is not configured");
    //     string checkout_session_cancel_url = _settingsRepository.GetSettingByKey("checkout_session_cancel_url").Result.ToString()
    //         ?? throw new CustomException("Checkout session cancel URL is not configured");

    //     // Create a session with price selection enabled
    //     var options = new SessionCreateOptions
    //     {
    //         Mode = "subscription",
    //         AutomaticPaymentMethods = new SessionAutomaticPaymentMethodsOptions
    //         {
    //             Enabled = true,
    //         },
    //         AllowPromotionCodes = true,
    //         SuccessUrl = $"{plantour_app_origin}/{checkout_session_success_url}?session_id={{CHECKOUT_SESSION_ID}}",
    //         CancelUrl = $"{plantour_app_origin}/{checkout_session_cancel_url}",

    //         // Enable price selection to allow users to choose from multiple prices
    //         ConsentCollection = new SessionConsentCollectionOptions
    //         {
    //             Terms = "none",
    //         },
    //         Consent = new SessionConsentOptions
    //         {
    //             Promotions = "auto",
    //         },

    //         // Configure price selection
    //         PaymentMethodCollection = "always",

    //         // Add your product IDs that you want to offer
    //         // Each product should have multiple prices attached in your Stripe dashboard
    //         LineItems = new List<SessionLineItemOptions>
    //     {
    //         new SessionLineItemOptions
    //         {
    //             // Specify just the product ID for the "Base" plan
    //             // Stripe will show all available prices for this product
    //             Price = null,
    //             Product = "prod_base_plan_id", // Replace with your actual Base plan product ID
    //             Adjustable = true,
    //             Quantity = 1,
    //         },
    //         new SessionLineItemOptions
    //         {
    //             // Specify just the product ID for the "Pro" plan
    //             // Stripe will show all available prices for this product
    //             Price = null,
    //             Product = "prod_pro_plan_id", // Replace with your actual Pro plan product ID
    //             Adjustable = true,
    //             Quantity = 1,
    //         }
    //     },

    //         // Show only one quantity selector
    //         PhoneNumberCollection = new SessionPhoneNumberCollectionOptions
    //         {
    //             Enabled = false,
    //         },
    //     };

    //     var service = new SessionService();
    //     var session = await service.CreateAsync(options);
    //     return session;
    // }



}
