using plantour_server.DbModels;
using plantour_server.Repositories;
using PlantourApi.Middleware;
using Stripe;

namespace plantour_server.Services;

public class StripeWebhookService(
    ILogger<StripeWebhookService> logger,
    UsersRepository userRepository,
    PlanRepository planRepository,
    SettingsRepository settingsRepository) : IStripeWebhookService
{
    private readonly ILogger<StripeWebhookService> _logger = logger;
    private readonly UsersRepository _userRepository = userRepository;
    private readonly PlanRepository _planRepository = planRepository;
    private readonly SettingsRepository _settingsRepository = settingsRepository;

    public async Task ProcessStripeEventAsync(Event stripeEvent)
    {

        switch (stripeEvent.Type)
        {
            case Stripe.EventTypes.CustomerDeleted:
                var deletedCustomer = stripeEvent.Data.Object as Customer;
                if (deletedCustomer == null)
                {
                    return;
                }
                await HandleCustomerDeletedAsync(deletedCustomer);
                break;

            case Stripe.EventTypes.CustomerSubscriptionCreated:
            case Stripe.EventTypes.CustomerSubscriptionUpdated:
                var subscription = stripeEvent.Data.Object as Subscription;
                if (subscription == null)
                {
                    return;
                }
                await HandleSubscriptionUpdatedAsync(subscription!);
                break;

            case Stripe.EventTypes.CustomerSubscriptionDeleted:
                var deletedSubscription = stripeEvent.Data.Object as Subscription;
                if (deletedSubscription == null)
                {
                    return;
                }
                await HandleSubscriptionDeletedAsync(deletedSubscription);
                break;

            default:
                _logger.LogInformation($"Unhandled event type: {stripeEvent.Type}");
                break;
        }
    }

    // TODO: send an email to admin if a user is on a paid plan without StripeCustomerId, so we can investigate
    public async Task HandleCustomerDeletedAsync(Customer customer)
    {
        var user = await _userRepository.GetByStripeCustomerIdAsync(customer.Id);
        if (user == null || user.StripePriceId == null)
        {
            return;
        }
        user.StripeCustomerId = null;
        await _userRepository.UpdateAsync(user);
    }

    public async Task HandleSubscriptionUpdatedAsync(Subscription subscription)
    {
        User? user = await _userRepository.GetByStripeCustomerIdAsync(subscription.CustomerId);
        if (user == null)
        {
            return;
        }

        var priceId = subscription.Items.Data[0].Price.Id;

        var possiblePriceIds = await _settingsRepository.GetStripePriceIds();
        if (!possiblePriceIds.Contains(priceId))
        {
            throw new CustomException($"Received subscription update with unknown price ID: {priceId}");
        }

        var periodEnd = subscription.Items.Data[0].CurrentPeriodEnd;
        var periodEndUtc =
            periodEnd.Kind == DateTimeKind.Utc ? periodEnd :
            periodEnd.Kind == DateTimeKind.Local ? periodEnd.ToUniversalTime() :
            DateTime.SpecifyKind(periodEnd, DateTimeKind.Utc); // Kind == Unspecified

        if (user.StripePriceEndsAt == periodEndUtc && user.StripePriceId == subscription.Items.Data[0].Price.Id)
        {
            return;
        }

        user.StripePriceEndsAt = periodEndUtc;
        user.StripePriceId = subscription.Items.Data[0].Price.Id;
        await _userRepository.UpdateAsync(user);
    }

    public async Task HandleSubscriptionDeletedAsync(Subscription subscription)
    {
        User? user = await _userRepository.GetByStripeCustomerIdAsync(subscription.CustomerId);
        if (user == null || (user.StripePriceId == null && user.StripePriceEndsAt == null))
        {
            return;
        }
        user.StripePriceId = null;
        user.StripePriceEndsAt = null;
        await _userRepository.UpdateAsync(user);
    }
}
