using Stripe;
using Stripe.Checkout;
using System.Threading.Tasks;

namespace plantour_server.Services;

public interface IStripeWebhookService
{
        Task ProcessStripeEventAsync(Event stripeEvent);
        Task HandleCustomerUpdatedAsync(Customer customer);
        Task HandleCustomerDeletedAsync(Customer customer);
        Task HandleSubscriptionUpdatedAsync(Subscription subscription);
        Task HandleSubscriptionDeletedAsync(Subscription subscription);
        Task HandleSubscriptionTrialEndingAsync(Subscription subscription);
        Task HandleInvoicePaymentSucceededAsync(Invoice invoice);
        Task HandleInvoicePaymentFailedAsync(Invoice invoice);
        Task HandleCheckoutSessionCompletedAsync(Session session);
}
