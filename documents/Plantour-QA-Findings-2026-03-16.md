# Plantour QA Consolidated Findings

Date: March 16, 2026

Target: [https://plantour-client-qa.onrender.com/](https://plantour-client-qa.onrender.com/)

Method:
- Black-box live-site testing in Chromium with Playwright
- Public route and form testing
- Authenticated guest-mode testing via the working backend endpoint `POST /api/users/create-temporary-user`
- Participant invite testing using disposable email inboxes
- Basic axe accessibility scan on representative public pages

## Executive Summary

The biggest blockers are in onboarding and public-entry flows.

- Normal admin email login is broken because the magic-link token exchange returns `500`.
- Public guest/demo entry points on the landing page and public templates page are broken in the UI.
- Participant onboarding is inconsistent: one email path works, while the trip-added email link and the manual access-code path do not produce the expected trip access.
- Once inside the app through guest auth or the working participant dashboard-token email link, much of the core CRUD flow works.

## Findings

### 1. High: Admin magic-link sign-in fails with server `500`

Pages:
- [https://plantour-client-qa.onrender.com/sign-in](https://plantour-client-qa.onrender.com/sign-in)

Repro:
1. Open `/sign-in`
2. Enter a valid admin email
3. Open the emailed magic link

Expected:
- The user is authenticated and taken into the app

Actual:
- The frontend calls `POST https://plantour-server-qa.onrender.com/api/users/admin/signin-token`
- The backend returns `500`
- The UI shows: `Sign In failed. The link may be expired. Please try to sign in one more time.`

Impact:
- Real admin end-to-end login is blocked

### 2. High: Public guest/demo entry points do nothing

Pages:
- [https://plantour-client-qa.onrender.com/](https://plantour-client-qa.onrender.com/)
- [https://plantour-client-qa.onrender.com/packing-list-generator/templates](https://plantour-client-qa.onrender.com/packing-list-generator/templates)

Repro:
1. On `/`, click `Try packing your items for the trip`
2. On `/packing-list-generator/templates`, click `Try no account needed`
3. On `/packing-list-generator/templates`, click a template row or `View`

Expected:
- The guest-access flow starts or the template route opens

Actual:
- The UI does nothing
- No useful navigation occurs
- No guest session is created from these public CTAs

Notes:
- The guest backend itself works through `POST /api/users/create-temporary-user`
- This appears to be a frontend/UI wiring issue rather than a guest-auth backend issue

### 3. High: Participant trip-added email link does not work for logged-out users

Email subject:
- `Plantour: You were added to Weekend in Las Vegas`

Link pattern:
- `https://plantour-client-qa.onrender.com/trips/{tripId}`

Repro:
1. Add a participant traveler
2. Add that traveler to a trip
3. Open the trip-added email in a fresh browser
4. Click or open the raw `/trips/{tripId}` link

Expected:
- The participant is signed in or at least guided into the trip they were added to

Actual:
- Opening the raw trip URL in a logged-out browser lands on `/`
- The user sees the public landing page instead of gaining trip access

Impact:
- The trip-notification email does not provide a working path into the trip for logged-out invitees

### 4. High: Manual participant access-code sign-in authenticates, but does not grant expected trip access

Page:
- [https://plantour-client-qa.onrender.com/sign-in/participant](https://plantour-client-qa.onrender.com/sign-in/participant)

Repro:
1. Create a participant and add them to a trip
2. Open the `Your Plantour invitation` email
3. Copy the access code
4. Open `/sign-in/participant`
5. Submit the valid access code

Expected:
- The participant is signed in and can access the trip they were invited to

Actual:
- `POST https://plantour-server-qa.onrender.com/api/users/participant/signin` returns `200`
- A token is stored locally
- The participant lands on the dashboard, but `/trips` shows `No rows`
- Direct trip routes fall back with `Trip specified in url does not exist. Please specify a valid trip to proceed.`

Impact:
- The manual participant sign-in flow does not behave as promised in the UI/email for trip access

### 5. Medium: Public header navigation is broken on public pages

Pages sampled:
- [https://plantour-client-qa.onrender.com/help](https://plantour-client-qa.onrender.com/help)

Repro:
1. Open a public page such as `/help`
2. Click the `Plantour` logo
3. Click `Dashboard`
4. Open the hamburger menu and click items such as `Contact Us` or `Help`

Expected:
- Navigation should move to the selected route

Actual:
- Clicks do not navigate

Impact:
- Public-site navigation feels broken and strands users on informational pages

### 6. Medium: Unauthenticated `/dashboard` deep-link resolves incorrectly

Page:
- [https://plantour-client-qa.onrender.com/dashboard](https://plantour-client-qa.onrender.com/dashboard)

Repro:
1. Open `/dashboard` in an unauthenticated session

Expected:
- The app should redirect cleanly to sign-in or the proper public landing page

Actual:
- The route resolves badly and previously rendered as an incomplete shell instead of a clean sign-in or landing experience

Impact:
- Deep-link handling is unreliable for logged-out users

### 7. Medium: Participant onboarding emails are inconsistent

Observed emails:
- `Your Plantour invitation`
- `Plantour: You were added to Weekend in Las Vegas`

Observed behavior:
- `Your Plantour invitation` includes:
  - a dashboard link with `accessToken` and `refreshToken`
  - an access code
  - a participant sign-in link
- `Plantour: You were added...` includes:
  - a raw trip URL only

Expected:
- All participant onboarding emails should provide a coherent, working path into the same trip context

Actual:
- The dashboard-token email works
- The raw trip-link email fails for logged-out users
- The manual access-code path authenticates but does not produce the same trip access

Impact:
- Participant onboarding is confusing and unreliable depending on which email path the user follows

### 8. Medium: Guest participant-limit enforcement returns `501`

Area:
- Trip participant add flow in guest mode

Repro:
1. Use guest mode
2. Add one participant successfully
3. Attempt to add a second extra participant beyond the guest-plan limit

Expected:
- The app should block the action with a business-rule status and clear user messaging

Actual:
- The UI shows the correct limit message:
  - `You've reached the limit of 2 participants you can add to your trip. Please go to your profile page and upgrade your plan to remove this limit.`
- The backend call `POST /api/tripuser` returns `501`

Impact:
- The user messaging is clear, but the HTTP status is semantically wrong for a plan/limit rule

### 9. Medium: Guest trip-item limit enforcement returns `501` and shows incorrect copy

Area:
- Trip item add flow in guest mode

Repro:
1. Use guest mode on the seeded trip
2. Add items until the guest limit is reached
3. Attempt one more add

Expected:
- The app should block the action with correct copy and a sensible business-rule status

Actual:
- The item is correctly blocked at the guest limit
- The user sees:
  - `You've reached the limit of 10 shared items you can add to your trip. Please go to your profile page and upgrade your plan to remove this limit.`
- The flow is for normal trip items, not shared items
- The backend `POST /api/TripThing` returns `501`

Impact:
- The rule works, but the status code and copy are misleading

### 10. Medium: Accessibility issues found by axe

Areas sampled:
- public pages
- sign-in page
- public templates/help-style cards

Issues observed:
- Buttons without accessible names
- Unlabeled radio input on sign-in
- Nested interactive elements
- Color-contrast failures

Impact:
- Real accessibility defects are present in the public experience

### 11. Low: User-facing copy issues

Examples observed:
- `Your are about to join a plan`
- `Administartor`

Impact:
- These reduce polish and trust, especially in onboarding and payment-adjacent flows

## Confirmed Working Areas

### Public

- Public pages loaded successfully:
  - `/`
  - `/sign-in`
  - `/sign-in/participant`
  - `/help`
  - `/contact`
  - `/privacy`
  - `/terms`
  - `/packing-list-generator/templates`
- Contact form validation and submission worked
- Invalid participant access-code handling worked
- Checkout entry pages loaded and valid email input launched the Paddle sandbox iframe
- Mobile sanity checks at narrow viewport widths showed no horizontal overflow on sampled pages

### Guest-mode Admin

Guest-mode auth itself worked through:
- `POST https://plantour-server-qa.onrender.com/api/users/create-temporary-user`

Authenticated guest routes successfully loaded:
- `/trips`
- `/travelers`
- `/things`
- `/todos`
- `/packs`
- `/templates`
- `/templates-ai`
- `/profile`
- `/trips/{tripId}/trip-things`
- `/trips/{tripId}/trip-packs`
- `/trips/{tripId}/trip-todos`
- `/trips/{tripId}/trip-participants`
- `/trips/{tripId}/trip-shared`
- `/trips/{tripId}/trip-shared-todos`
- `/trips/{tripId}/trip-comments`

Authenticated guest actions confirmed working:
- trip create
- trip delete
- trip item add
- trip item delete
- trip todo add
- trip bag add
- trip comment send
- shared item add
- shared item delete
- shared todo add
- traveler create
- participant add to trip
- global todo add
- global todo delete
- profile update

### Participant

Working participant path:
- The `Your Plantour invitation` email contains a dashboard link with tokens
- Opening that link in a fresh browser created a participant session and allowed access to:
  - `/trips`
  - `/trips/{tripId}/trip-shared`
  - `/trips/{tripId}/trip-comments`
  - `/profile`

## Current Test Limits

The following areas are still blocked or not fully testable from the current environment:

- Full real admin end-to-end testing through the normal login path, because admin magic-link auth is broken
- Full OAuth completion with real Google/Facebook accounts
- Final payment completion with real payment credentials
- Broader participant end-to-end validation through the manual access-code path, because it does not currently return the expected trip access
- Any authenticated admin scenarios that depend specifically on the real email-login path rather than guest-mode access

## Recommended Triage Order

1. Fix admin magic-link login
2. Fix public guest/demo CTAs
3. Fix participant onboarding consistency:
   - trip-added email link
   - manual access-code sign-in
   - alignment between participant auth and trip membership
4. Fix public header navigation
5. Clean up guest-limit response codes and copy
6. Address accessibility defects
