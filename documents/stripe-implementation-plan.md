# Stripe implementation plan (Plantour)

Date: 2026-02-13

Goal: implement the full set of requirements described in [stripe-integration.md](stripe-integration.md): subscriptions (2 plans × monthly/yearly), access control based on subscription state, Stripe Checkout purchase flow, Customer Portal for self-service, Stripe Tax for country/tax, invoicing, refunds, and robust webhook processing.

Assumption for MVP path: **Stripe Checkout (subscription mode) + Stripe Customer Portal + Stripe Tax (automatic_tax)**.

---

## Phase 0 — Decide business rules (before writing code)

**Step 0.1: Finalize paid plan names and mapping**
- Action: confirm the 2 paid plans (names and what each unlocks) and confirm if Plantour’s internal plan names are `Family` and `Expedition` (or different).
- Result: one canonical mapping table: `{PlantourPlanName -> Stripe Product -> Stripe Price IDs (monthly/yearly)}`.

Implemented: Confirmed 2 paid plans, Family USD4.99/month or USD29.99/year and Expedition USD14.99/month or USD89.99/year 


**Step 0.2: Decide upgrade/downgrade/cancel policy**
- Action: write down decisions for:
  - upgrades: immediate vs end-of-period
  - downgrades: immediate vs end-of-period
  - proration: on/off
  - cancellation: immediate vs end-of-period
  - overdue grace period: how many days before access is revoked
- Result: a short policy section that implementation can follow consistently.

Implemented: 
  - upgrades: immediate
  - downgrades: end-of-period
  - proration: on
  - cancellation: end-of-period
  - overdue grace period: 7 days before access is revoked



**Step 0.3: Decide who sends overdue emails**
- Action: choose Stripe Billing emails vs Plantour emails (or both).
- Result: clear ownership for customer notifications.

Implemented:
- Stripe Billing emails: ON (invoice/receipt + payment failure reminders, retry schedule)
- Plantour emails (via Brevo), triggered by webhooks:
When first failure happens: short heads-up + link to “Manage billing” (portal)
24h before you revoke access (based on your grace period): “Action required”
When access is actually revoked/downgraded: “Access paused” (and how to restore)
When payment succeeds after delinquency: “Access restored”

---

## Phase 1 — Stripe Dashboard setup

**Step 1.1: Activate Stripe account**
- Action: complete Stripe activation (business details, bank account, address).
- Result: Stripe account can process live payments.

**Step 1.2: Create Products and Prices**
- Action: in Stripe Dashboard create:
  - Product A (Plan A)
    - Price A monthly
    - Price A yearly
  - Product B (Plan B)
    - Price B monthly
    - Price B yearly
- Result: you have 4 Price IDs (`price_...`) saved in a secure note.

**Step 1.3: Enable Stripe Tax**
- Action: enable Stripe Tax and add your tax registrations where you’re obligated to collect.
- Result: Stripe Tax is active and can calculate tax on Checkout/subscriptions.

**Step 1.4: Configure Billing dunning**
- Action: configure Billing retries and reminder emails (Smart Retries / invoice reminders).
- Result: Stripe is configured to retry failed payments and optionally email customers.

**Step 1.5: Configure invoices/receipts branding**
- Action: set logo, business info, invoice footer, receipt settings.
- Result: invoices/receipts look correct for customers.

**Step 1.6: Configure Customer Portal**
- Action: enable Customer Portal and configure allowed actions (update card, cancel, switch plans if desired).
- Result: users can self-manage billing without custom UI.

**Step 1.7: Create webhook endpoint (event destination)**
- Action: add webhook endpoint URL (to Plantour API) and subscribe to events:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.paid`
  - `invoice.payment_failed`
  - `invoice.finalization_failed`
  - `refund.created`, `refund.updated`, `refund.failed` (if refunds are automated)
- Result: webhook signing secret (`whsec_...`) is generated and saved.

---

## Phase 2 — Server configuration (secrets + settings)

**Step 2.1: Add Stripe settings to configuration**
- Action: add a `StripeSettings` section to server configuration (use env vars/user-secrets for secrets):
  - `StripeSettings:SecretKey` (`sk_...`)
  - `StripeSettings:WebhookSigningSecret` (`whsec_...`)
  - `StripeSettings:PublishableKey` (`pk_...`) (optional for client display)
  - `StripeSettings:SuccessUrl` / `CancelUrl`
  - `StripeSettings:PlanPriceIds:{plan}:{interval}` or similar mapping
- Result: config structure exists in `appsettings.*.json` and is overridable by environment variables.

**Step 2.2: Put secrets in the right place**
- Action:
  - dev: set secrets using .NET user-secrets (`UserSecretsId` exists in the csproj).
  - qa/prod: set secrets as environment variables in hosting provider.
- Result: no Stripe secrets are committed into repo; app can start with Stripe enabled.

---

## Phase 3 — Database schema (PostgreSQL)

Plantour appears to be **DB-first** (schema scripts exist in `plantour-server/DB/Scripts/`). This plan assumes we add a new SQL script and apply it to the DB.

**Step 3.1: Create Stripe tables SQL script**
- Action: create a new SQL script file, e.g. `plantour-server/DB/Scripts/6 stripe-billing.sql`.
- Result: a single script contains all Stripe-related DDL.

**Step 3.2: Add Stripe customer mapping table**
- Action: add table to map Plantour user → Stripe customer:

```sql
create table if not exists plantour.stripe_customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references plantour.users(id),
  stripe_customer_id text not null,
  created_at timestamp without time zone not null default (now() at time zone 'utc'),
  unique(user_id),
  unique(stripe_customer_id)
);
```

- Result: DB can store a stable Stripe customer id for each Plantour user.

**Step 3.3: Add subscription state table**
- Action: add table to store Stripe subscription and current entitlement state:

```sql
create table if not exists plantour.stripe_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references plantour.users(id),
  stripe_subscription_id text not null,
  stripe_price_id text not null,
  status text not null,
  current_period_start timestamp without time zone null,
  current_period_end timestamp without time zone null,
  cancel_at_period_end boolean not null default false,
  canceled_at timestamp without time zone null,
  created_at timestamp without time zone not null default (now() at time zone 'utc'),
  updated_at timestamp without time zone not null default (now() at time zone 'utc'),
  unique(stripe_subscription_id)
);
```

- Result: Plantour can determine entitlement from Stripe subscription state.

**Step 3.4: Add webhook event dedup table (idempotency)**
- Action: store processed Stripe event IDs:

```sql
create table if not exists plantour.stripe_webhook_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text not null,
  type text not null,
  received_at timestamp without time zone not null default (now() at time zone 'utc'),
  processed_at timestamp without time zone null,
  processing_error text null,
  unique(stripe_event_id)
);
```

- Result: webhook handler can safely ignore duplicates and handle retries.

**Step 3.5: Apply the script to dev/qa/prod databases**
- Action: execute the SQL script using your deployment workflow (e.g., `psql` against the right DB).
- Result: all Stripe tables exist in each environment.

---

## Phase 4 — Server code (Stripe Checkout + Webhooks + Access updates)

**Step 4.1: Add Stripe .NET SDK dependency**
- Action: add NuGet package `Stripe.net` to `plantour-server.csproj`.
- Result: server can call Stripe APIs.

**Step 4.2: Add Stripe settings binding**
- Action: create a `StripeSettings` model and register it with `IOptions<StripeSettings>`.
- Result: Stripe keys/URLs/mappings are strongly typed.

**Step 4.3: Add DB models + DbSets for Stripe tables**
- Action: add EF models for `stripe_customers`, `stripe_subscriptions`, `stripe_webhook_events` (using `[Table(...)]` attributes like existing models) and add `DbSet<>` properties via a partial `PlantourContext` file.
- Result: Stripe data can be read/written via EF, consistent with the rest of the server.

**Step 4.4: Implement “Start subscription checkout” endpoint**
- Action: add an authenticated API endpoint:
  - Input: plan + interval
  - Server behavior:
    - get/create Stripe customer
    - create Checkout Session in subscription mode with selected Price
    - enable address collection (needed for Tax)
    - enable automatic tax
  - Output: Checkout Session URL
- Result: client can redirect user to Stripe Checkout to purchase a subscription.

**Step 4.5: Implement webhook endpoint with signature verification**
- Action: add a public API endpoint `/api/stripe/webhook` that:
  - reads raw request body
  - verifies `Stripe-Signature` with `WebhookSigningSecret`
  - writes a row to `stripe_webhook_events` and dedupes by `stripe_event_id`
  - processes only supported event types
- Result: Plantour securely receives Stripe events and ignores duplicates.

**Step 4.6: Implement entitlement update logic (core business rule)**
- Action: centralize mapping from Stripe events → local access/plan updates.
  - On successful subscription payment (`invoice.paid` and/or subscription active):
    - set user `AccessType` to `Active`
    - set `PlanId` to the paid plan
    - persist subscription status + period dates
  - On delinquency (`invoice.payment_failed`, subscription `past_due`):
    - record state; optionally notify; keep access per grace policy
  - On cancellation/unpaid (`customer.subscription.deleted` or status `canceled/unpaid`):
    - downgrade plan and/or set access as required
- Result: Plantour access reliably follows Stripe billing state.

**Step 4.7: Implement “Create customer portal session” endpoint**
- Action: add an authenticated endpoint returning a Stripe Customer Portal URL.
- Result: user can manage billing, update card, download invoices, cancel.

**Step 4.8: Add refund support (admin-only)**
- Action: add admin endpoint(s) to issue refunds (by payment/invoice) and store a minimal record (or rely on Stripe as source of truth + webhook).
- Result: support can refund customers from Plantour.

**Step 4.9: Add “Billing status” API endpoint**
- Action: return current plan, subscription status, period end, and portal link availability.
- Result: client can show a billing screen without embedding Stripe secrets.

**Step 4.10: Add observability and safe logging**
- Action: log webhook processing outcomes (event id/type, processing time) without storing full PII payload.
- Result: production debugging is possible without leaking sensitive data.

---

## Phase 5 — Client (Angular)

**Step 5.1: Add a Billing page or section**
- Action: implement a minimal UI that shows current plan and provides:
  - “Upgrade” / “Choose plan” (calls Start Checkout)
  - “Manage billing” (opens portal URL)
- Result: users can subscribe and manage billing from the client.

**Step 5.2: Implement Checkout redirect flow**
- Action: call server endpoint to create Checkout session and redirect browser to returned URL.
- Result: purchase flow works end-to-end.

**Step 5.3: Post-checkout UX**
- Action: after Stripe redirects back, show a “Processing your payment…” state and refresh billing status until webhook updates access.
- Result: users aren’t confused during the webhook sync delay.

---

## Phase 6 — Local testing, QA, and rollout

**Step 6.1: Install and use Stripe CLI for local webhooks**
- Action: install Stripe CLI and run `stripe listen --forward-to http://localhost:<port>/api/stripe/webhook`.
- Result: webhooks are testable locally without deploying.

**Step 6.2: Test happy-path subscription purchase (test mode)**
- Action: buy each of the 4 price combinations in test mode.
- Result: Plantour user becomes `Active` and correct plan is assigned.

**Step 6.3: Test failure scenarios**
- Action: use Stripe test cards to trigger:
  - payment failure → `invoice.payment_failed`
  - refund created/failed (if supported)
  - missing address for Tax (if you enforce it)
- Result: Plantour handles failures without granting incorrect access.

**Step 6.4: Reconcile idempotency**
- Action: replay webhooks (Stripe CLI or Dashboard) and confirm no double-updates.
- Result: duplicate events do not cause duplicate entitlements/emails.

**Step 6.5: QA environment deployment**
- Action: deploy server with test keys + QA webhook endpoint configured.
- Result: end-to-end QA works in a realistic environment.

**Step 6.6: Production rollout**
- Action: switch to live keys + live webhook destination + confirm Tax + Billing settings.
- Result: production subscriptions are enabled.

---

## Phase 7 — Annual tax reporting (optional automation)

**Step 7.1: Decide reporting format and scope**
- Action: define what you want “once a year calculating sales taxes and send info to me” to mean (jurisdictions, currency, time zone, totals).
- Result: unambiguous requirements for the report.

**Step 7.2: Implement a scheduled yearly report job**
- Action: add a background job (or external scheduler) that queries Stripe/exports reports and emails admin summary.
- Result: you receive a yearly tax summary automatically.
