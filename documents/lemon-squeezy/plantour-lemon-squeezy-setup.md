# Plantour Lemon Squeezy Setup

This project now contains a Lemon Squeezy payment implementation on both the server and client.

## What Plantour expects

- `PaymentProcessorSettings:Provider` should be set to `LemonSqueezy`.
- `LemonSqueezySettings:ApiKey` must be a server-side secret API key.
- `LemonSqueezySettings:StoreId` must be your Lemon Squeezy store ID.
- The existing database fields keep their current names, but now store Lemon Squeezy IDs:
  - `plans.paddle_product_id` stores the Lemon product ID.
  - `prices.paddle_price_id` stores the Lemon variant ID.
  - `users.paddle_subscription_id` stores the Lemon subscription ID.

## Recommended Lemon Squeezy account setup

1. Open Lemon Squeezy and switch to Test Mode first.
2. Create a test store for Plantour.
3. Create a test API key in `Settings -> API`.
4. Copy the store ID and API key into the Plantour server configuration.
5. Create subscription products for each public Plantour plan.
6. Inside each product, create subscription variants for each billing option.

## Naming and ID mapping

Plantour matches plans by stored provider IDs, not by display text.

- Put the Lemon product ID into the matching `plans.paddle_product_id` row.
- Put the Lemon variant ID into the matching `prices.paddle_price_id` row.

Recommended mapping:

- `Family` plan product -> Lemon product for Family.
- `Family Monthly` price -> Lemon monthly subscription variant.
- `Family Yearly` price -> Lemon yearly subscription variant.
- `Expedition` plan product -> Lemon product for Expedition.
- `Expedition Monthly` price -> Lemon monthly subscription variant.
- `Expedition Yearly` price -> Lemon yearly subscription variant.

## Checkout and portal behavior

- Plantour creates a custom Lemon checkout on the server and opens it with Lemon.js overlay on the client.
- Plantour uses the subscription `urls.customer_portal` URL for billing self-service.
- Plan upgrades and downgrades are done by updating the subscription variant.

## Upgrade and downgrade semantics

- Upgrades use Lemon Squeezy immediate invoicing with prorations enabled.
- Downgrades use Lemon Squeezy deferred billing behavior with prorations enabled.

This is the closest Lemon-native equivalent to the previous Paddle behavior.

## Test checklist

1. Confirm landing page plan cards load with the Lemon-backed product and variant IDs.
2. Open checkout and verify the Lemon overlay appears.
3. Complete a test subscription purchase.
4. Sign in again and verify the profile billing portal opens.
5. Upgrade and downgrade between variants and verify the subscription changes in Lemon.
6. Confirm the stored subscription ID in Plantour updates to the Lemon subscription ID.

## Going live

1. Switch Lemon Squeezy from Test Mode to live mode.
2. Create the live store products and live subscription variants.
3. Create a live API key.
4. Replace the test store ID and API key in production configuration.
5. Update the Plantour database rows so the stored product and variant IDs point at the live Lemon IDs.

## Notes

- Lemon Squeezy test and live mode use different API keys and different store data.
- The local PDF creators guide could not be extracted directly in this environment, so the implementation was based on Lemon Squeezy official API and Lemon.js documentation.