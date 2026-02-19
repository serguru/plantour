User: @stripe I have a web app Plantour, .Net API + PostgreSQL + Angular, which charges customers for 2 subscriptions monthly or yearly each. Give me a detailed step-by-step plan what I should do to build an integration with Stripe. I will start with sandbox and once ready go to live environment. Include what is necessary to do on the Stripe website as well as what code (including SQL tables) has to be implemented. Stripe should store customers, track their subscriptions, accept and send payments, notify users on certain events, send invoices to them and do all the things necessary for normal subscriptions based integration with Plantour. Do not forget to include things to be done for the Angular 20 web app. Do not write any code for now, just give me a comprehensive plan. 


Stripe: # Comprehensive Plan for Stripe Integration with Plantour

## Initial Setup

- Create a [Stripe account](https://dashboard.stripe.com/register) if you don't have one already
- Navigate to the Dashboard and create a [sandbox](https://docs.stripe.com/billing/testing) for testing

## Stripe Dashboard Configuration

1. **Create Products and Prices**:
   - Go to [Products section](https://dashboard.stripe.com/products)
   - Create two subscription products with monthly and yearly pricing options
   - Note the Price IDs for each subscription option (you'll need these in your code)

2. **Configure Webhook Endpoints**:
   - Go to Developers > Webhooks
   - Add an endpoint URL (e.g., https://yourapp.com/api/stripe/webhook)
   - Select relevant events to listen for (particularly `customer.subscription.created`, `invoice.paid`, etc.)
   - Note the Webhook Secret for verification

3. **Configure Customer Portal**:
   - Go to Settings > Customer Portal
   - Customize branding, return URL, and allowed actions

## Database Setup

Create the following tables in PostgreSQL:

```
- StripeCustomers (Id, UserId, StripeCustomerId, Email, CreatedAt)
- StripeSubscriptions (Id, UserId, StripeSubscriptionId, Status, CurrentPeriodEnd, ProductId, PriceId, CreatedAt)
- StripePaymentMethods (Id, UserId, StripeCustomerId, StripePaymentMethodId, Type, Last4, Brand, ExpMonth, ExpYear, IsDefault)
- StripeInvoices (Id, UserId, StripeInvoiceId, Amount, Status, InvoiceUrl, PdfUrl, CreatedAt)
- StripeEvents (Id, EventId, EventType, ObjectId, ObjectType, Data, CreatedAt, ProcessedAt)
```

## Backend Implementation (.NET API)

1. **Install Packages**:
   - Stripe.net NuGet package
   - Any additional packages for webhook handling

2. **Configuration**:
   - Add Stripe API keys to appsettings.json (test keys initially)
   - Configure webhook secret in appsettings.json

3. **Create Core Services**:
   - `StripeCustomerService`: Manage customer creation, retrieval, and updates
   - `StripeSubscriptionService`: Handle subscription creation, updates, and cancellations
   - `StripePaymentService`: Manage payment methods and process payments
   - `StripeWebhookService`: Process incoming webhook events

4. **Implement API Endpoints**:
   - `POST /api/stripe/customers`: Create/update customers
   - `POST /api/stripe/checkout-session`: Create checkout sessions
   - `GET /api/stripe/portal-session`: Create customer portal sessions
   - `POST /api/stripe/webhook`: Handle webhook events
   - `GET /api/stripe/subscriptions`: Get user subscriptions
   - `GET /api/stripe/payment-methods`: Get user payment methods
   - `GET /api/stripe/invoices`: Get user invoices

5. **Implement Webhook Handler**:
   - Create controller to receive webhook events
   - Verify webhook signatures
   - Process events and update local database
   - Configure event handlers for different event types

## Frontend Implementation (Angular)

1. **Install Packages**:
   - `@stripe/stripe-js` for JavaScript integration

2. **Create Core Services**:
   - `StripeService`: Interface with your backend Stripe endpoints

3. **Implement Components**:
   - `SubscriptionPlansComponent`: Display available subscription plans
   - `CheckoutComponent`: Handle redirecting to Stripe Checkout
   - `PaymentMethodsComponent`: Display and manage payment methods
   - `SubscriptionsComponent`: Display active subscriptions
   - `InvoicesComponent`: Display past invoices

4. **User Flows to Implement**:
   - New subscription signup
   - Subscription management (upgrade/downgrade)
   - Payment method management
   - Invoice viewing
   - Cancellation flow

## Integration Workflows

1. **New User Subscription Flow**:
   - User selects a subscription plan
   - Create a Stripe customer if it doesn't exist
   - Create a Checkout Session for the selected plan
   - Redirect user to Stripe Checkout
   - Handle successful payment via webhook
   - Update local database with subscription details

2. **Subscription Management Flow**:
   - User wants to update subscription
   - Create a Customer Portal Session
   - Redirect user to Stripe Customer Portal
   - Handle subscription updates via webhooks

3. **Payment Processing**:
   - Stripe automatically charges customers
   - Webhooks notify your application of successful/failed payments
   - Update subscription status accordingly

## Webhook Events to Handle

Listen for these key events:
- `customer.created` & `customer.updated`
- `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
- `invoice.created`, `invoice.paid`, `invoice.payment_failed`
- `payment_method.attached`, `payment_method.detached`
- `checkout.session.completed`

## Testing Plan

1. **Test in Sandbox**:
   - Create test customers
   - Process test subscriptions
   - Test webhook handling for various events
   - Simulate payment failures using [test cards](https://docs.stripe.com/testing#cards)

2. **Test User Flows**:
   - New subscription signup
   - Subscription changes
   - Payment method updates
   - Invoice generation and viewing

## Go-Live Process

1. **Pre-Launch Checklist**:
   - Review [Stripe's account checklist](https://docs.stripe.com/get-started/account/checklist)
   - Review [development checklist](https://docs.stripe.com/get-started/checklist/go-live)
   - Review [website checklist](https://docs.stripe.com/get-started/checklist/website)

2. **Switch to Production**:
   - Update API keys to production keys
   - Update webhook URLs to production endpoints
   - Ensure proper error handling and monitoring

3. **Post-Launch Monitoring**:
   - Monitor webhook delivery
   - Track subscription statuses
   - Monitor failed payments