using Microsoft.Extensions.Logging;
using plantour_server.DbModels;
using plantour_server.Repositories;
using Stripe;
using System;
using System.Threading.Tasks;

namespace plantour_server.Services;

public class StripeWebhookService : IStripeWebhookService
{
    private readonly ILogger<StripeWebhookService> _logger;
    private readonly UsersRepository _userRepository;
    private readonly PlanRepository _planRepository;
    private readonly CustomerSubscriptionRepository _subscriptionRepository;

    public StripeWebhookService(
        ILogger<StripeWebhookService> logger,
        UsersRepository userRepository,
        PlanRepository planRepository,
        CustomerSubscriptionRepository subscriptionRepository)
    {
        _logger = logger;
        _userRepository = userRepository;
        _planRepository = planRepository;
        _subscriptionRepository = subscriptionRepository;

    }

    public async Task ProcessStripeEventAsync(Event stripeEvent)
    {
        switch (stripeEvent.Type)
        {
            // Customer events
            case "customer.created":
            case "customer.updated":
                var customer = stripeEvent.Data.Object as Customer;
                if (customer != null)
                {
                    await HandleCustomerUpdatedAsync(customer);
                }
                else
                {
                    _logger.LogError("Failed to cast event data to Customer object");
                }
                break;

            case "customer.deleted":
                var deletedCustomer = stripeEvent.Data.Object as Customer;
                if (deletedCustomer != null)
                {
                    await HandleCustomerDeletedAsync(deletedCustomer);
                }
                else
                {
                    _logger.LogError("Failed to cast event data to Customer object for deletion");
                }
                break;

            // Subscription events
            case "customer.subscription.created":
            case "customer.subscription.updated":
                var subscription = stripeEvent.Data.Object as Subscription;
                if (subscription != null)
                {
                    await HandleSubscriptionUpdatedAsync(subscription);
                }
                else
                {
                    _logger.LogError("Failed to cast event data to Subscription object");
                }
                break;

            case "customer.subscription.deleted":
                var deletedSubscription = stripeEvent.Data.Object as Subscription;
                if (deletedSubscription != null)
                {
                    await HandleSubscriptionDeletedAsync(deletedSubscription);
                }
                else
                {
                    _logger.LogError("Failed to cast event data to Subscription object for deletion");
                }
                break;

            case "customer.subscription.trial_will_end":
                var trialEndingSubscription = stripeEvent.Data.Object as Subscription;
                if (trialEndingSubscription != null)
                {
                    await HandleSubscriptionTrialEndingAsync(trialEndingSubscription);
                }
                else
                {
                    _logger.LogError("Failed to cast event data to Subscription object for trial ending");
                }
                break;

            // Invoice events
            case "invoice.payment_succeeded":
                var invoice = stripeEvent.Data.Object as Invoice;
                if (invoice != null)
                {
                    await HandleInvoicePaymentSucceededAsync(invoice);
                }
                else
                {
                    _logger.LogError("Failed to cast event data to Invoice object for payment success");
                }
                break;

            case "invoice.payment_failed":
                var failedInvoice = stripeEvent.Data.Object as Invoice;
                if (failedInvoice != null)
                {
                    await HandleInvoicePaymentFailedAsync(failedInvoice);
                }
                else
                {
                    _logger.LogError("Failed to cast event data to Invoice object for payment failure");
                }
                break;

            default:
                _logger.LogInformation($"Unhandled event type: {stripeEvent.Type}");
                break;
        }
    }

    public async Task HandleCustomerUpdatedAsync(Customer customer)
    {
        _logger.LogInformation($"Processing customer update for {customer.Id}");

        var user = await _userRepository.GetByStripeCustomerIdAsync(customer.Id);
        if (user != null)
        {
            user.Email = customer.Email;
            // Update other relevant fields from customer metadata if needed

            await _userRepository.UpdateAsync(user);
            _logger.LogInformation($"Updated user {user.Id} from Stripe customer {customer.Id}");
        }
        else
        {
            _logger.LogWarning($"Stripe customer {customer.Id} not found in database");
        }
    }

    public async Task HandleCustomerDeletedAsync(Customer customer)
    {
        _logger.LogInformation($"Processing customer deletion for {customer.Id}");

        var user = await _userRepository.GetByStripeCustomerIdAsync(customer.Id);
        if (user != null)
        {
            //user.IsActive = false;
            user.PlanId = (await _planRepository.GetByName("Trial"))!.Id;
            user.StripeCustomerId = null; // Or keep it with a note that it's been deleted on Stripe

            await _userRepository.UpdateAsync(user);
            _logger.LogInformation($"Changed plan for the user {user.Id} to Trial after Stripe customer deletion");
        }
    }

    public async Task HandleSubscriptionUpdatedAsync(Subscription subscription)
    {
        _logger.LogInformation($"Processing subscription update for {subscription.Id}");

        var customerSubscription = await _subscriptionRepository.GetByStripeIdAsync(subscription.Id);

        if (customerSubscription == null)
        {
            // New subscription - find the user and create a new CustomerSubscription
            var user = await _userRepository.GetByStripeCustomerIdAsync(subscription.CustomerId);
            if (user != null)
            {
                customerSubscription = new CustomerSubscription
                {
                    UserId = user.Id,
                    StripeSubscriptionId = subscription.Id,
                    SubscriptionStatus = subscription.Status,
                    CurrentPeriodEnd = subscription.Items.Data[0].CurrentPeriodEnd,
                    CurrentPeriodStart = subscription.Items.Data[0].CurrentPeriodStart,
                    CancelAtPeriodEnd = subscription.CancelAtPeriodEnd,
//                    StripePriceId = subscription.Items.Data[0].Price.Id,
                    CreatedAt = DateTime.UtcNow
                };

                await _subscriptionRepository.AddAsync(customerSubscription);
                _logger.LogInformation($"Created new subscription for user {user.Id}");
            }
            else
            {
                _logger.LogWarning($"User with Stripe customer ID {subscription.CustomerId} not found");
            }
        }
        else
        {
            // Update existing subscription
            customerSubscription.SubscriptionStatus = subscription.Status;
            customerSubscription.CurrentPeriodEnd = subscription.Items.Data[0].CurrentPeriodEnd;
            customerSubscription.CurrentPeriodStart = subscription.Items.Data[0].CurrentPeriodStart;
            customerSubscription.CancelAtPeriodEnd = subscription.CancelAtPeriodEnd;
//            customerSubscription.StripePriceId = subscription.Items.Data[0].Price.Id;
            customerSubscription.UpdatedAt = DateTime.UtcNow;

            await _subscriptionRepository.UpdateAsync(customerSubscription);
            _logger.LogInformation($"Updated subscription {customerSubscription.Id} for user {customerSubscription.UserId}");
        }
    }

    public async Task HandleSubscriptionDeletedAsync(Subscription subscription)
    {
        _logger.LogInformation($"Processing subscription deletion for {subscription.Id}");

        var customerSubscription = await _subscriptionRepository.GetByStripeIdAsync(subscription.Id);

        if (customerSubscription != null)
        {
            customerSubscription.SubscriptionStatus = subscription.Status; // Should be "canceled"
            //customerSubscription.CancelAtPeriodEnd = DateTime.UtcNow;
            customerSubscription.UpdatedAt = DateTime.UtcNow;

            await _subscriptionRepository.UpdateAsync(customerSubscription);
            _logger.LogInformation($"Marked subscription {customerSubscription.Id} as canceled");
        }
    }

    public async Task HandleSubscriptionTrialEndingAsync(Subscription subscription)
    {
        _logger.LogInformation($"Processing trial ending for subscription {subscription.Id}");

        // We just log this event since Stripe will handle customer notifications
        var user = await _userRepository.GetByStripeCustomerIdAsync(subscription.CustomerId);
        if (user != null)
        {
            _logger.LogInformation($"Trial ending for user {user.Id}, subscription {subscription.Id}");
        }

        await Task.CompletedTask;
    }

    public async Task HandleInvoicePaymentSucceededAsync(Invoice invoice)
    {
        _logger.LogInformation($"Processing successful payment for invoice {invoice.Id}");


        // Update subscription payment status or user's billing history
        if (!string.IsNullOrEmpty(invoice.Lines.Data[0].SubscriptionId))
        {
            var customerSubscription = await _subscriptionRepository.GetByStripeIdAsync(invoice.Lines.Data[0].SubscriptionId);

            if (customerSubscription != null)
            {
                // Update payment record or create an entry in your payment history table
                // customerSubscription.LastPaymentSucceeded = true;
                // customerSubscription.LastPaymentDate = DateTime.UtcNow;

                await _subscriptionRepository.UpdateAsync(customerSubscription);
                _logger.LogInformation($"Updated payment status for subscription {customerSubscription.Id}");
            }
        }
    }

    public async Task HandleInvoicePaymentFailedAsync(Invoice invoice)
    {
        _logger.LogInformation($"Processing failed payment for invoice {invoice.Id}");

        // Just update our records, as Stripe will handle customer dunning emails
        if (!string.IsNullOrEmpty(invoice.Lines.Data[0].SubscriptionId))
        {
            var customerSubscription = await _subscriptionRepository.GetByStripeIdAsync(invoice.Lines.Data[0].SubscriptionId);

            if (customerSubscription != null)
            {
                // Update payment status
                // customerSubscription.LastPaymentSucceeded = false;
                // customerSubscription.LastPaymentFailureDate = DateTime.UtcNow;

                await _subscriptionRepository.UpdateAsync(customerSubscription);
                _logger.LogInformation($"Updated failed payment status for subscription {customerSubscription.Id}");
            }
        }
    }
}
