## Configure Customer Portal in Detail

The Stripe Customer Portal allows your users to self-manage their subscriptions, payment methods, and invoices without requiring you to build this functionality from scratch. Here's a detailed breakdown of how to configure it:

### Dashboard Configuration Steps

1. **Access Customer Portal Settings**:
   - Go to [Dashboard > Settings > Billing > Customer Portal](https://dashboard.stripe.com/settings/billing/portal)
   - If this is your first time, you'll need to activate the portal

2. **Configure Branding Options**:
   - Upload your Plantour logo and favicon
   - Set your brand colors (primary, text, and background colors)
   - Add your business name and contact information
   - Configure privacy policy and terms of service URLs

3. **Configure Subscription Management**:
   - Toggle "Switch plan" to ON if you want customers to switch between your two subscription options
   - Toggle "Update quantities" if applicable for your subscription model
   - Set proration options for subscription updates (immediate or at period end)
   - Configure how downgrades are handled (immediate or at end of billing period)
   - Enable promotion codes if you want to allow discounts during plan changes

4. **Configure Cancellation Management**:
   - Toggle "Cancel subscription" to ON to allow users to cancel
   - Enable "Cancellation reason" to collect feedback when users cancel
   - Consider enabling "Retention coupons" to offer discounts to users who attempt to cancel

5. **Configure Payment Method Management**:
   - Enable payment method updating
   - Select which payment methods are available

6. **Configure Invoice History**:
   - Enable invoice viewing and downloading
   - Configure invoice payment options

7. **Configure Customer Information Management**:
   - Toggle "Billing information" to allow customers to update their details
   - Consider enabling "Tax ID collection" if you need to collect tax information

8. **Set Default Return URL**:
   - Configure where customers will be redirected after exiting the portal
   - This can be overridden in code when creating portal sessions

### Additional Portal Configuration Options

1. **Configure Email Prefill (Optional)**:
   - Enable this if you want to prefill customer email addresses when creating sessions

2. **Create Multiple Portal Configurations (Advanced)**:
   - If needed, you can create different portal configurations for different customer segments
   - This requires using the [API to create configurations](https://docs.stripe.com/api/customer_portal/configuration)
   - Example use case: Different features for premium vs. basic customers

3. **Testing the Portal**:
   - Click "Preview" to see how the portal will look to customers
   - This shows a read-only version for testing purposes
   - For full testing, create a test customer and use "Open customer portal" from the customer details page

### Implementation Considerations

1. **Portal Session Creation**:
   - In your .NET backend, implement an endpoint that creates portal sessions
   - You'll need to authenticate users before creating sessions for them
   - Pass the customer ID and return URL when creating sessions

2. **Integration with Angular**:
   - Create a "Manage Subscription" button in your account management UI
   - When clicked, call your backend endpoint to create a portal session
   - Redirect the user to the returned session URL

3. **Handling Portal Events**:
   - Configure webhooks to listen for changes made in the portal
   - Important events include `customer.subscription.updated`, `customer.updated`, etc.
   - Process these events to keep your database in sync

4. **Portal Limitations**:
   - Customers cannot modify subscriptions with multiple products or usage-based billing
   - The portal cannot be displayed in an iframe
   - Sessions are temporary (expire after 5 minutes of inactivity)

5. **Mobile Considerations**:
   - The portal is mobile-responsive
   - Ensure your redirect handling works properly on mobile devices

For more details, see [Configure the customer portal](https://docs.stripe.com/customer-management/configure-portal) and [Integrate the customer portal](https://docs.stripe.com/customer-management/integrate-customer-portal).