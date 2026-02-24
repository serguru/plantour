# CheckoutComponent (Paddle Inline)

This component embeds Paddle checkout in **inline mode** and opens it from query params.

## Official Paddle docs used

- Build an inline checkout: https://developer.paddle.com/build/checkout/build-branded-inline-checkout
- `Paddle.Checkout.open()` reference: https://developer.paddle.com/paddlejs/methods/paddle-checkout-open
- Pass checkout settings: https://developer.paddle.com/build/checkout/set-up-checkout-default-settings

## What this component expects

Route: `/checkout`

Query params:
- `priceId` (required) — Paddle Price ID (example: `pri_...`)

Example:

```text
/checkout?priceId=pri_01abcxyz
```

## How it works

1. `CheckoutComponent` reads `priceId` from URL query params.
2. The page asks for email (`Please enter your email`) and waits for user to click `Proceed`.
3. It calls backend `GET /api/paddle/active-subscription-exists?email=...`.
4. If active subscription exists, it shows `You already have an active subscription` and redirects to `/profile`.
5. Otherwise it calls `PaddleService.openInlineCheckout()` with prefilled email.
6. Paddle opens checkout with these key inline settings:
   - `displayMode: "inline"`
   - `frameTarget: "paddle-inline-checkout-container"`
   - `frameInitialHeight: "450"`
   - `frameStyle` with required width/min-width

## Prerequisites

1. Paddle client-side token must be valid for the selected environment.
2. Paddle default payment link must be configured (Paddle docs requirement).
3. For live mode, your payment-link domain must be approved by Paddle.

## Notes

- Current `PaddleService.joinPrice()` still opens **overlay** checkout for existing flows.
- `openInlineCheckout()` is used only by this component.
- If `priceId` is missing, the component shows an error message and does not open checkout.
