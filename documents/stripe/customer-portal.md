# Paddle Customer Portal integration (Plantour)

This document describes how Plantour integrates Paddle Customer Portal sessions using the official Paddle API:
- Overview: https://developer.paddle.com/api-reference/customer-portals/overview
- Create session: https://developer.paddle.com/api-reference/customer-portals/create-customer-portal-session
- App integration guide: https://developer.paddle.com/build/customers/integrate-customer-portal

## What is implemented

### Server endpoint
- `POST /api/paddle/customer-portal-session`
- Authorization: `AdminOnly` (requires authenticated admin token)
- Behavior:
  1. Resolves current user from auth context.
  2. Resolves Paddle customer ID from `CurrentUser.PaddleCustomerId`, or falls back to searching Paddle customer by email.
  3. Calls Paddle API: `POST /customers/{customer_id}/portal-sessions`.
  4. If current user has `PaddleSubscriptionId`, sends it as `subscription_ids` to also get subscription deep links.
  5. Returns `data.urls.general.overview` as `{ "url": "..." }`.

### Client behavior
- Profile page billing link calls backend endpoint above.
- On success, browser redirects to returned temporary Paddle portal URL.

## Why this follows Paddle guidance

- Portal session links are short-lived and **must not be cached**.
- A new session is created each time user opens billing management.
- API key remains server-side only.
- Customer portal is opened as a normal page (not iframe), per Paddle recommendation.

## Configuration requirements

Set Paddle settings in server configuration (`appsettings.*.json` or env vars):

```json
"PaddleSettings": {
  "ApiBaseUrl": "https://api.paddle.com/",
  "ApiKey": "<PADDLE_API_KEY>"
}
```

For sandbox testing, use Paddle sandbox API key and the same API base URL.

## How to use (UI)

1. Sign in as admin in Plantour.
2. Open Profile page.
3. Click "billing, plan and subscription".
4. App requests a new portal session from backend.
5. User is redirected to Paddle Customer Portal (authenticated link).

## How to use (API)

### Request

```http
POST /api/paddle/customer-portal-session
Authorization: Bearer <jwt>
Content-Type: application/json

{}
```

### Response

```json
{
  "url": "https://customer-portal.paddle.com/...&token=..."
}
```

## Notes

- Returned URL token is temporary; do not store in DB/localStorage.
- If customer does not exist in Paddle, endpoint returns an error.
- If API key is missing/invalid, endpoint returns Paddle/API error from backend.

## Why you may not see an "Upgrade" button

Based on Paddle docs, customer portal sessions provide:
- general overview link (`urls.general.overview`)
- subscription deep links for `cancel_subscription`
- subscription deep links for `update_subscription_payment_method`

Paddle docs do **not** define a dedicated "upgrade" deep link in customer portal sessions.

### What enables plan switching in the portal

Plan switching in the portal is available through **Paddle Retain Cancellation Flows** as a salvage attempt:
- Configure Retain in Paddle Dashboard
- Configure Cancellation Flows
- Add salvage attempt type **Plan switch**
- Map source plan -> offered plan in the flow settings

Important: Paddle docs state Retain uses live data and cannot be fully tested with sandbox accounts.

### If you need direct upgrade outside cancellation flow

Implement your own upgrade workflow in app/API using subscription update operations:
- `PATCH /subscriptions/{subscription_id}`
- Replace `items` with target price(s)
- Use `proration_billing_mode`

From Paddle docs, recurring items on a subscription must share the same billing interval, and subscription changes are blocked when:
- subscription is `past_due`
- next billing period is within 30 minutes
