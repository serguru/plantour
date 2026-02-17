using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using plantour_server.DbModels;
using plantour_server.Repositories;
using PlantourApi.Middleware;
using Stripe;
using Stripe.Checkout;
using System;
using System.Text.Json;
using System.Threading.Tasks;

namespace plantour_server.Services;

public class StripeWebhookService : IStripeWebhookService
{
    private readonly ILogger<StripeWebhookService> _logger;
    private readonly UsersRepository _userRepository;
    private readonly PendingUsersRepository _pendingUserRepository;
    private readonly PlanRepository _planRepository;
    private readonly CustomerSubscriptionRepository _subscriptionRepository;



    public StripeWebhookService(
        ILogger<StripeWebhookService> logger,
        UsersRepository userRepository,
        PlanRepository planRepository,
        CustomerSubscriptionRepository subscriptionRepository,
        PendingUsersRepository pendingUserRepository)
    {
        _logger = logger;
        _userRepository = userRepository;
        _planRepository = planRepository;
        _subscriptionRepository = subscriptionRepository;
        _pendingUserRepository = pendingUserRepository;

    }

    public async Task ProcessStripeEventAsync(Event stripeEvent)
    {

        switch (stripeEvent.Type)
        {
            // Customer events
            case Stripe.EventTypes.CustomerCreated:
            case Stripe.EventTypes.CustomerUpdated:
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

            case Stripe.EventTypes.CustomerDeleted:
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
            case Stripe.EventTypes.CustomerSubscriptionCreated:
            case Stripe.EventTypes.CustomerSubscriptionUpdated:
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

            case Stripe.EventTypes.CustomerSubscriptionDeleted:
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

            case Stripe.EventTypes.CustomerSubscriptionTrialWillEnd:
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
            case Stripe.EventTypes.InvoicePaymentSucceeded:
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

            case Stripe.EventTypes.InvoicePaymentFailed:
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
            case Stripe.EventTypes.CheckoutSessionCompleted:
                var session = stripeEvent.Data.Object as Session;
                if (session != null)
                {
                    await HandleCheckoutSessionCompletedAsync(session);
                }
                else
                {
                    _logger.LogError("Failed to cast event data to Session object for checkout session completion");
                }
                break;
            case Stripe.EventTypes.PaymentIntentSucceeded:

                var paymentIntent = stripeEvent.Data.Object as PaymentIntent;

                if (paymentIntent != null)
                {
                    await ProcessSessionConfirmedPayment(paymentIntent);
                }
                else
                {
                    _logger.LogError("Failed to cast event data to PaymentIntent object for payment intent success");
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

    public async Task HandleCheckoutSessionCompletedAsync(Session session)
    {
        if (session.PaymentStatus == "paid")
        {
            // Payment confirmed (immediate payment methods)

            // For sessions that are already paid, retrieve the PaymentIntent to process it
            if (!string.IsNullOrEmpty(session.PaymentIntentId))
            {
                var paymentIntentService = new PaymentIntentService();
                var paymentIntent = await paymentIntentService.GetAsync(session.PaymentIntentId);

                // Now process the payment intent
                await ProcessSessionConfirmedPayment(paymentIntent);
            }
            else
            {
                // Handle case where there's no payment intent (e.g., for free subscriptions)
                _logger.LogWarning($"Checkout session {session.Id} completed with no payment intent Id, unable to confirm payment");
            }
        }
        else if (session.PaymentStatus == "unpaid")
        {
            // Mark as pending (for delayed payment methods)
            await CreatePendingUserFromSession(session);
            // You'll need to listen for payment_intent.succeeded later
        }
        else
        {
            _logger.LogWarning($"Checkout session {session.Id} completed with unexpected payment status: {session.PaymentStatus}");
        }
    }

    public async Task<PendingUser> CreatePendingUserFromSession(Stripe.Checkout.Session session)
    {
        // Check if a pending user already exists with this checkout session ID
        var existingUserBySession = await _pendingUserRepository.GetByCheckoutSessionIdAsync(session.Id);
        if (existingUserBySession != null)
        {
            // Update the existing record with fresh data
            existingUserBySession.PaymentIntentId = session.PaymentIntentId;
            existingUserBySession.SubscriptionId = session.SubscriptionId;
            existingUserBySession.CustomerId = session.CustomerId;
            existingUserBySession.Status = "awaiting_payment";
            existingUserBySession.ExpiresAt = DateTime.UtcNow.AddHours(24);
            existingUserBySession.Metadata = CreateMetadataObject(session);

            await _pendingUserRepository.UpdateAsync(existingUserBySession);
            return existingUserBySession;
        }

        // Extract customer email
        string customerEmail = session.CustomerEmail;

        // If email isn't available directly, retrieve from customer object
        if (string.IsNullOrEmpty(customerEmail) && !string.IsNullOrEmpty(session.CustomerId))
        {
            var customerService = new CustomerService();
            var customer = await customerService.GetAsync(session.CustomerId);
            customerEmail = customer.Email;
        }

        // Since email is not unique, we'll always create a new pending user
        // for a new checkout session, regardless of email duplicates

        // Extract name from metadata if available
        string? firstName = null;
        string? lastName = null;

        if (session.Metadata != null)
        {
            session.Metadata.TryGetValue("first_name", out firstName);
            session.Metadata.TryGetValue("last_name", out lastName);
        }

        // Create pending user object
        var pendingUser = new PendingUser
        {
            Id = Guid.NewGuid(),
            Email = customerEmail,
            FirstName = firstName,
            LastName = lastName,
            CheckoutSessionId = session.Id,
            PaymentIntentId = session.PaymentIntentId,
            SubscriptionId = session.SubscriptionId,
            PlanId = ExtractPlanIdFromSession(session),
            CustomerId = session.CustomerId,
            Metadata = CreateMetadataObject(session),
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddHours(24),
            Status = "awaiting_payment"
        };

        // Save to database with exception handling
        try
        {
            await _pendingUserRepository.AddAsync(pendingUser);
        }
        catch (DbUpdateException ex)
        {
            // Handle constraint violations (checkout_session_id is still unique)
            _logger.LogWarning($"Failed to add pending user: {ex.Message}");

            // Try to retrieve the record that might have been created in a race condition
            var racedUser = await _pendingUserRepository.GetByCheckoutSessionIdAsync(session.Id);

            if (racedUser != null)
                return racedUser;

            throw; // Re-throw if we can't recover
        }

        return pendingUser;
    }

    // Helper method to extract plan ID from session
    private string? ExtractPlanIdFromSession(Stripe.Checkout.Session session)
    {
        // Option 1: Extract from line items if available
        if (session.LineItems != null)
        {
            foreach (var item in session.LineItems)
            {
                if (item.Price?.Id != null)
                    return item.Price.Id;
            }
        }

        // Option 2: Extract from metadata if you stored it there
        if (session.Metadata != null && session.Metadata.TryGetValue("plan_id", out var planId))
        {
            return planId;
        }

        // Option 3: If you have subscription ID, you can look up the plan
        // This would require an additional API call to Stripe

        return null;
    }

    // Helper method to create a metadata JSON string with relevant session data
    private string CreateMetadataObject(Stripe.Checkout.Session session)
    {
        // Create a JSON object with any additional data you want to store
        var metadata = new Dictionary<string, object?>
        {
            ["checkout_mode"] = session.Mode,
            ["currency"] = session.Currency,
            ["amount_total"] = session.AmountTotal,
            ["payment_status"] = session.PaymentStatus
        };

        // Add any custom metadata from the session
        if (session.Metadata != null)
        {
            foreach (var item in session.Metadata)
            {
                // Only add items not already extracted to specific fields
                if (!new[] { "first_name", "last_name", "plan_id" }.Contains(item.Key))
                {
                    metadata[$"custom_{item.Key}"] = item.Value;
                }
            }
        }

        return System.Text.Json.JsonSerializer.Serialize(metadata);
    }

    ////////////////////////////////////////


    /// <summary>
    /// Process a confirmed payment for a checkout session
    /// </summary>
    /// <param name="paymentIntent">The PaymentIntent object from Stripe webhook</param>
    /// <returns>True if a pending user was found and processed, false otherwise</returns>
    public async Task<bool> ProcessSessionConfirmedPayment(PaymentIntent paymentIntent)
    {
        // Find the pending user associated with this payment intent
        var pendingUsers = await _pendingUserRepository.FindAsync(p => p.PaymentIntentId == paymentIntent.Id && p.Status == "awaiting_payment");
        var pendingUser = pendingUsers.FirstOrDefault();

        if (pendingUser == null)
        {
            return false;
        }

        try
        {

            // Create the actual user account
            var user = await CreateUserFromPendingUser(pendingUser);

            // Set up the user's subscription
            if (!string.IsNullOrEmpty(pendingUser.SubscriptionId))
            {
                await AssignSubscriptionToUser(user.Id, pendingUser.SubscriptionId, pendingUser.PlanId);
            }

            // Mark the payment as processed
            pendingUser.Status = "payment_confirmed";
            await _pendingUserRepository.UpdateAsync(pendingUser);

            _logger.LogInformation($"Successfully processed payment for user {user.Id} with payment intent {paymentIntent.Id}");

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Failed to process confirmed payment for pending user {pendingUser.Id}");

            // Mark the pending user record with an error status for manual review
            pendingUser.Status = "error_processing";
            pendingUser.Metadata = UpdateMetadataWithError(pendingUser.Metadata, ex.Message);
            await _pendingUserRepository.UpdateAsync(pendingUser);

            throw;
        }
    }

    /// <summary>
    /// Creates a regular user account from a pending user record
    /// </summary>
    private async Task<User> CreateUserFromPendingUser(PendingUser pendingUser)
    {
        // Check if a user with this email already exists
        var existingUser = await _userRepository.GetByEmailAsync(pendingUser.Email);

        if (existingUser != null)
        {
            // Handle the case where the user already exists
            // This might happen if they're upgrading or creating a second subscription
            _logger.LogInformation($"User with email {pendingUser.Email} already exists, updating subscription");

            // Update any relevant user information
            if (!string.IsNullOrEmpty(pendingUser.CustomerId))
            {
                existingUser.StripeCustomerId = pendingUser.CustomerId;
                await _userRepository.UpdateAsync(existingUser);
            }

            return existingUser;
        }

        // Create a new user
        // TODO: send an email to the user with an invitation to register as a Plantour uesr
        //
        var user = new User
        {
            Email = pendingUser.Email,
            FirstName = pendingUser.FirstName,
            LastName = pendingUser.LastName,
            StripeCustomerId = pendingUser.CustomerId,



            // Set appropriate default values
            IsEmailVerified = true, // Since they completed payment, we can trust the email
            RegistrationDate = DateTime.UtcNow,
            // Generate a temporary password or send a password reset link
            PasswordHash = await _passwordHasher.HashPasswordAsync(Guid.NewGuid().ToString())
        };

        // Save the new user
        await _userService.CreateUserAsync(user);


        // Optional: Generate and send a password reset link
        var resetToken = await _userService.GeneratePasswordResetTokenAsync(user.Id);
        await _emailService.SendPasswordSetupEmail(user.Email, resetToken);

        return user;
    }

    /// <summary>
    /// Assigns a subscription to a user
    /// </summary>
    private async Task AssignSubscriptionToUser(Guid userId, string subscriptionId, string planId)
    {
        var subscription = new UserSubscription
        {
            UserId = userId,
            SubscriptionId = subscriptionId,
            PlanId = planId,
            Status = "active",
            StartDate = DateTime.UtcNow
        };

        // Retrieve additional information from Stripe if needed
        var subscriptionService = new SubscriptionService();
        var stripeSubscription = await subscriptionService.GetAsync(subscriptionId);

        // Set the end date if available
        if (stripeSubscription.CurrentPeriodEnd.HasValue)
        {
            subscription.CurrentPeriodEnd = stripeSubscription.CurrentPeriodEnd.Value.ToUniversalTime();
        }

        await _subscriptionService.CreateSubscriptionAsync(subscription);
    }

    /// <summary>
    /// Updates the metadata JSON with error information
    /// </summary>
    private string UpdateMetadataWithError(string? metadata, string errorMessage)
    {
        // Parse the existing metadata or create new if empty
        JObject metadataObj;
        try
        {
            metadataObj = string.IsNullOrEmpty(metadata)
                ? new JObject()
                : JObject.Parse(metadata);
        }
        catch (Newtonsoft.Json.JsonException)
        {
            // Invalid JSON, start fresh
            metadataObj = new JObject();
            if (!string.IsNullOrEmpty(metadata))
            {
                metadataObj["original_invalid_metadata"] = metadata;
            }
        }

        // Add error information
        metadataObj["error_message"] = errorMessage;
        metadataObj["error_timestamp"] = DateTime.UtcNow.ToString("o");

        // Return updated JSON
        return metadataObj.ToString(Formatting.Indented);
    }


    /// <summary>
    /// Process a failed payment for a checkout session
    /// </summary>
    /// <param name="paymentIntent">The PaymentIntent object from Stripe webhook</param>
    /// <returns>True if a pending user was found and processed, false otherwise</returns>
    public async Task<bool> ProcessSessionFailedPayment(PaymentIntent paymentIntent)
    {
        // Find the pending user associated with this payment intent
        var pendingUser = await _dbContext.PendingUsers
            .FirstOrDefaultAsync(p => p.PaymentIntentId == paymentIntent.Id && p.Status == "awaiting_payment");

        if (pendingUser == null)
        {
            _logger.LogInformation($"No pending user found for failed payment intent {paymentIntent.Id}");
            return false;
        }

        try
        {
            // Update the pending user record to reflect the failed payment
            pendingUser.Status = "payment_failed";

            // Update metadata with failure details
            var metadataObj = pendingUser.Metadata?.Deserialize<Dictionary<string, object>>() ?? new Dictionary<string, object>();
            metadataObj["payment_failure_reason"] = paymentIntent.LastPaymentError?.Message ?? "Unknown error";
            metadataObj["payment_failure_code"] = paymentIntent.LastPaymentError?.Code ?? "unknown";
            metadataObj["payment_failure_time"] = DateTime.UtcNow;
            pendingUser.Metadata = JsonSerializer.SerializeToDocument(metadataObj);

            await _dbContext.SaveChangesAsync();

            // Optional: Send payment failed notification to user
            await _emailService.SendPaymentFailedEmail(pendingUser.Email, paymentIntent.LastPaymentError?.Message);

            _logger.LogInformation($"Marked pending user {pendingUser.Id} as failed payment");

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error processing failed payment for pending user {pendingUser.Id}");
            throw;
        }
    }

}
