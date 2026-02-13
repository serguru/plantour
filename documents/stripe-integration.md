# Stripe integration for Plantour (server + client)

Date: 2026-02-13

This document maps Plantour’s subscription requirements to Stripe features, explains what Stripe expects you to do in the Stripe Dashboard, and outlines what needs to be implemented in Plantour (DB/API/client). No code is included here.

## Official Stripe docs (entry points)

- Subscriptions overview (Billing): https://docs.stripe.com/billing/subscriptions/overview
- Using webhooks with subscriptions: https://docs.stripe.com/billing/subscriptions/webhooks
- Webhooks overview (security + retries): https://docs.stripe.com/webhooks
- Checkout (accept payments): https://docs.stripe.com/payments/accept-a-payment
- Invoicing: https://docs.stripe.com/invoicing
- Stripe Tax overview: https://docs.stripe.com/tax
- Stripe Tax for subscriptions: https://docs.stripe.com/tax/subscriptions
- Refunds: https://docs.stripe.com/refunds
- Customer portal: https://docs.stripe.com/customer-management
- Testing: https://docs.stripe.com/testing
- Stripe CLI (local webhook testing): https://docs.stripe.com/stripe-cli

## What you want (and which Stripe products cover it)

### Subscriptions (2 paid plans × monthly/yearly)

Stripe model:
- Products: typically one per plan (e.g., “Family”, “Expedition”).
- Prices: one per billing interval (e.g., Family monthly, Family yearly, Expedition monthly, Expedition yearly).

Plantour should not calculate renewal billing itself; Stripe Billing does that.

### Tracking subscription state + changes

Stripe is asynchronous. The correct pattern is:
- Plantour DB stores Stripe identifiers (customer/subscription/price).
- Plantour processes webhooks to update local access state.

Relevant events include `customer.subscription.*` and `invoice.*`. Stripe explicitly recommends using webhooks for subscription lifecycle tracking:
https://docs.stripe.com/billing/subscriptions/webhooks

### Overdue payments + notifications

Stripe provides:
- Subscription states (`active`, `past_due`, `unpaid`, `canceled`, etc.)
- Invoice events like `invoice.payment_failed` / `invoice.paid`
- Billing automations (Smart Retries + reminder emails) configured in Dashboard.

Plantour must decide:
- Whether Stripe emails customers for dunning, Plantour does, or both.
- When Plantour revokes/downgrades access (grace period policy).

### Invoices + taxes by country

Invoices:
- Subscriptions automatically generate invoices.
- Stripe Invoicing handles branding, invoice PDFs, sending, etc.

Taxes:
- Stripe Tax supports automatic tax calculation/collection for subscriptions.
- Stripe Tax requires sufficient customer location inputs (billing/shipping address).
- If tax can’t be computed due to missing location, invoice finalization may fail and you must handle it.

Docs:
- https://docs.stripe.com/tax/subscriptions
- https://docs.stripe.com/billing/subscriptions/webhooks

### Accept payments

Recommended MVP approach: **Stripe Checkout** in `mode=subscription`.
- Server creates a Checkout Session for the selected Price.
- Client redirects to Stripe-hosted Checkout.
- Webhook confirms completion and updates Plantour access.

### Refunds

Stripe supports refunds via API and Dashboard. Refunds can be async and can fail later, so webhook-driven reconciliation matters.

Docs: https://docs.stripe.com/refunds

### “Once a year calculate sales taxes and send info to me”

Stripe Tax provides reporting and exports in the Stripe Dashboard.

Two realistic options:
1) Operational: export reports annually from Stripe Dashboard.
2) Productized: implement a yearly scheduled job in Plantour that aggregates Stripe tax totals and emails an admin summary.

Exact reporting mechanisms vary by Stripe configuration/region, so treat this as a separate “reporting” feature with clarified requirements.

## What you likely forgot (common missing requirements)

1) Disputes/chargebacks: handle operationally and consider webhook handling.
2) SCA/3DS: subscription payments may require authentication.
3) Proration + upgrade/downgrade + cancellation rules: define explicit policy.
4) Customer self-service: Stripe Customer Portal can cover card updates, cancellation, invoice downloads.
5) Webhook reliability: idempotency, dedupe, retry behavior, observability.
6) Environment separation: test vs live keys, webhook secrets, endpoints.
7) Security: keep secret keys server-side only; avoid logging PII-heavy payloads.

## Stripe Dashboard setup checklist

### 1) Create account and complete activation
- Business details, bank account, business address, etc.

### 2) Get API keys
- Publishable key (`pk_*`) for client usage.
- Secret key (`sk_*`) for server usage.

Keep separate per environment:
- Test mode keys (dev/QA)
- Live mode keys (prod)

### 3) Create Products and Prices
Create 2 Products (your paid plans) and 4 Prices:
- Plan A monthly / yearly
- Plan B monthly / yearly

Store the resulting Price IDs in server configuration (or use price `lookup_key` and resolve dynamically).

### 4) Configure Billing (dunning)
In Billing settings:
- Enable and configure retries / reminder emails.
- Decide what happens as invoices become delinquent.

### 5) Configure invoices
- Branding, footer text, receipt email behavior.

### 6) Enable Stripe Tax
- Enable Stripe Tax.
- Add registrations where you’re obligated to collect.
- Ensure product tax codes are correct.

### 7) Configure webhooks
Create a webhook endpoint (Stripe Workbench / Webhooks):
- URL: `https://<your-api-host>/api/stripe/webhook`
- Copy signing secret (`whsec_*`).

Typical events to subscribe to:
- `checkout.session.completed` (Checkout flow)
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`
- `invoice.finalization_failed`
- `refund.created`, `refund.updated`, `refund.failed` (if refunds are automated)

## What should be built in Plantour

Plantour already has plan/access concepts:
- User has `PlanId` + `AccessTypeId` in ../plantour-server/DbModels/User.cs
- AccessType repo expects `Active` and `Pending` in ../plantour-server/Repositories/AccessTypeRepository.cs
- Plan repo expects `NoPlan` and `Trial` plan names in ../plantour-server/Repositories/PlanRepository.cs

### DB changes (recommended minimum)

Add storage for Stripe identifiers and sync state.

Minimum needed:
- Store Stripe customer id per user.
- Store Stripe subscription id + status + current period start/end.

Strongly recommended:
- Store processed webhook event IDs for idempotency/deduplication.

Optional (for richer billing UI):
- Store invoice IDs/URLs, last payment failure timestamp, next retry time.

### Server/API endpoints (typical set)

1) Start Checkout subscription
- Authenticated endpoint.
- Input: selected plan + interval.
- Output: Checkout session URL.

2) Stripe webhook
- Public endpoint.
- Verify signature (raw body + `whsec_*`).
- Deduplicate events by Stripe event ID.
- Update Plantour access state based on Stripe subscription/invoice outcomes.

3) Customer portal session
- Authenticated endpoint returning portal URL.

4) Billing status
- Authenticated endpoint returning current plan, renewal date, status, and invoice links if available.

5) Refunds (admin/support)
- Admin-only endpoint to issue refunds (plus webhook reconciliation).

### Client (Angular)

If using Checkout + Portal, client work can stay small:
- Plan selection UI → call API to start Checkout → redirect.
- “Manage billing” button → call API → open portal URL.
- Status UI that reflects “Active/Pending/Past due” from server.

## Webhook handling (Stripe requirements)

Stripe’s non-negotiables:
- Verify webhook signatures.
- Use raw request body for verification.
- Handle retries and duplicate deliveries.
- Don’t assume event ordering.
- Return 2xx quickly; do heavy work async.

Docs: https://docs.stripe.com/webhooks

## Implementation feasibility / scope estimate

This is implementable in this workspace (ASP.NET Core + EF Core + Angular).

Rough estimate if you choose Checkout + Customer Portal:
- MVP (start checkout, webhook activation, portal, basic tax on checkout): ~3–7 dev days.
- Add refunds tooling + internal invoice UI + custom overdue email logic + reconciliation jobs: ~1–3 additional weeks.
- Annual tax reporting automation (once requirements clarified): ~1–5 dev days.

Main risk areas:
- Webhook correctness (idempotency + retries + ordering).
- Tax/address collection and handling missing location inputs.
- Business policy decisions for proration/cancellation/grace periods.