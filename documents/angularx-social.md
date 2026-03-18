# Angularx Social Login in Plantour

This document describes the Angular client changes made to switch Plantour sign-in social authentication to @abacritt/angularx-social-login for Google and Facebook.

## What was changed

- Added angularx-social-login provider configuration to the standalone Angular application in app.config.ts.
- Registered only Google and Facebook providers.
- Replaced the custom SDK calls inside sign-in.ts with the package SocialAuthService.
- Replaced the Google custom button flow with the package Google Sign-In button directive.
- Kept the existing Plantour backend API call unchanged: the client still sends the Google ID token or Facebook access token to /users/admin/social/signin.

## Files changed

- plantour-client/src/app/app.config.ts
- plantour-client/src/app/components/sign-in/sign-in.ts
- plantour-client/src/app/components/sign-in/sign-in.html
- documents/angularx-social.md

## How the new client flow works

### Google

1. app.config.ts registers GoogleLoginProvider with the configured googleClientId.
2. The sign-in template renders the package element asl-google-signin-button.
3. Google Identity Services handles the Google popup and returns a SocialUser through SocialAuthService.authState.
4. sign-in.ts reads user.idToken from that SocialUser.
5. The component requests a bot-protection token.
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

- GoogleLoginProvider
- FacebookLoginProvider

Important options:

- Google uses oneTapEnabled: false.
  This keeps the page focused on explicit button-based sign-in instead of One Tap.
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

- https://github.com/abacritt/angularx-social-login
- https://developers.google.com/identity/gsi/web/guides/overview
- https://developers.google.com/identity/gsi/web/guides/verify-google-id-token

### Facebook setup

1. Open Meta for Developers.
2. Select your app.
3. Add the Facebook Login product if it is not already added.
4. In Facebook Login settings, enable Login with JavaScript SDK.
5. Add your site domains to Allowed Domains for the JavaScript SDK.
6. Use HTTPS for non-local environments.
7. Put the App ID into the Plantour frontend environment as facebookAppId.
8. Keep the App Secret on the backend only.

Official references used:

- https://github.com/abacritt/angularx-social-login
- https://developers.facebook.com/docs/facebook-login/web

## Notes and limitations

- Google sign-in through this package is button-driven. The package documentation states that calling signIn() for Google has no effect, so Plantour now uses the package Google sign-in button directive instead.
- Google popup sizing is controlled by Google Identity Services. Plantour can control the rendered button width, but not the size of the Google authentication popup window itself.
- Facebook still uses a custom Plantour button, but the authentication flow now goes through the package provider instead of direct SDK calls in sign-in.ts.
- The backend contract was not changed by this client refactor.

## User-visible result

- Admin sign-in continues to offer Google, Facebook, and email-link sign-in.
- Participant sign-in is unchanged.
- If Google or Facebook is not configured for the current environment, that provider button is hidden.