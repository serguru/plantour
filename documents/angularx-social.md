# Social Login in Plantour

This document describes the current Angular client social-auth setup in Plantour.

## What was changed

- Kept angularx-social-login provider configuration only for Facebook.
- Replaced the deprecated package Google button flow with direct Google Identity Services integration.
- Kept the visible Google button style unchanged by rendering a hidden GIS button over the existing Plantour button.
- Kept the existing Plantour backend API call unchanged: the client still sends the Google ID token or Facebook access token to /users/admin/social/signin.

## Files changed

- plantour-client/src/app/app.config.ts
- plantour-client/src/app/components/sign-in/sign-in.ts
- plantour-client/src/app/components/sign-in/sign-in.html
- plantour-client/src/app/services/social-auth-service.ts
- plantour-client/src/app/services/users-service.ts
- documents/angularx-social.md

## How the new client flow works

### Google

1. sign-in.ts loads the official Google Identity Services script from accounts.google.com/gsi/client through plantour-client/src/app/services/social-auth-service.ts.
2. The sign-in template renders the existing Plantour Google button and overlays a hidden GIS-rendered button on top of it.
3. The service initializes google.accounts.id once for the page and renders the GIS button with popup mode.
4. Google returns a credential response containing an ID token through the GIS callback.
5. sign-in.ts requests a bot-protection token.
6. The component sends the Google ID token to the existing Plantour API endpoint.
7. The API verifies the token and signs the user into Plantour.

### Facebook

1. app.config.ts registers FacebookLoginProvider with the configured facebookAppId.
2. The Facebook button in sign-in.html calls SocialAuthService.signIn(FacebookLoginProvider.PROVIDER_ID).
3. The package loads and initializes the Facebook JavaScript SDK.
4. Facebook returns a SocialUser.
5. sign-in.ts reads user.authToken from that SocialUser.
6. The component requests a bot-protection token.
7. The component sends the Facebook access token to the existing Plantour API endpoint.
8. The API verifies the token and signs the user into Plantour.

## app.config.ts details

The social config is registered through the package SOCIAL_AUTH_CONFIG token.

Configured providers:

- FacebookLoginProvider

Important options:

- Facebook uses scope email,public_profile.
- Facebook uses fields name,email,picture,first_name,last_name.
- Facebook uses Graph API version v25.0.
- autoLogin is false.

If a provider ID is missing in the environment config, that provider is not registered and its UI is not shown.

## How to use it

### Local setup

Set the client environment values:

- googleClientId
- facebookAppId

These are already part of the Plantour environment object shape.

### Google setup

1. Open Google Cloud Console.
2. Create or select the OAuth app for Plantour.
3. Create a Web application OAuth client.
4. Add authorized JavaScript origins for each Plantour client URL, for example:
   - http://localhost:4203
   - https://qa.plantour.app
   - https://plantour.app
5. Copy the client ID.
6. Put that value into the Plantour frontend environment as googleClientId.
7. Ensure the backend SocialAuthSettings.GoogleClientId matches the same client ID.

Official references used:

- https://developers.google.com/identity/gsi/web/guides/display-button
- https://developers.google.com/identity/gsi/web/reference/js-reference
- https://developers.google.com/identity/gsi/web/guides/overview
- https://developers.google.com/identity/gsi/web/guides/migration
- https://developers.google.com/identity/gsi/web/guides/verify-google-id-token

### Facebook setup

1. Open Meta for Developers.
2. Select your app.
3. Add the Facebook Login product if it is not already added.
4. In Facebook Login settings, enable Login with JavaScript SDK.
5. Add your site domains to Allowed Domains for the JavaScript SDK.
6. Add the corresponding site URLs to the Facebook Login settings where Meta requires URLs for your environment.
7. Use HTTPS for non-local environments.
8. For Plantour QA, ensure the QA origin is explicitly configured:
  - https://plantour-client-qa.onrender.com
9. Put the App ID into the Plantour frontend environment as facebookAppId.
10. Keep the App Secret on the backend only.

Official references used:

- https://github.com/abacritt/angularx-social-login
- https://developers.facebook.com/docs/facebook-login/web

## Notes and limitations

- Google sign-in no longer uses angularx-social-login. Plantour now uses the official Google Identity Services button API directly.
- Google Identity Services should be initialized once per page. Plantour keeps that responsibility inside plantour-client/src/app/services/social-auth-service.ts.
- Google popup sizing is controlled by Google Identity Services. Plantour can control the rendered button width, but not the size of the Google authentication popup window itself.
- Facebook still uses a custom Plantour button, but the authentication flow now goes through the package provider instead of direct SDK calls in sign-in.ts.
- The backend contract was not changed by this client refactor.
- If Facebook works in local development but fails in QA with JSSDK Option is Not Toggled, the usual cause is Meta app configuration for the QA origin, not Plantour code. Check the JavaScript SDK toggle and the allowed QA domain settings in Meta for Developers.

## User-visible result

- Admin sign-in continues to offer Google, Facebook, and email-link sign-in.
- Participant sign-in is unchanged.
- If Google or Facebook is not configured for the current environment, that provider button is hidden.