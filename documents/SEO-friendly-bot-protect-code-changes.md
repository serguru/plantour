# SEO-Friendly Bot Protection For Plantour: Necessary Code Changes

## Goal

List the future code changes needed to protect Plantour from abusive bots without hurting normal SEO crawling, rendering, indexing, or ranking.

No code is changed now. This is a planning document only.

## Core Rule

Apply anti-bot controls to sensitive actions, not to normal crawlable content.

That means:

- do not gate normal public page loads with CAPTCHA or challenge
- do not add anti-bot logic that blocks public SSR pages on first HTML response
- do add protections to sensitive `POST` actions and abuse-prone APIs

## Public Plantour Endpoints That Need Code-Level Protection

These are the best first code targets:

- `POST /api/users/admin/send-signin-email`
- `POST /api/users/admin/signin-token`
- `POST /api/users/admin/social/signin`
- `POST /api/users/participant/signin`
- `POST /api/users/create-temporary-user`
- `POST /api/users/contact/submit`
- `POST /api/users/refresh-token`
- anonymous account-state or enumeration-style endpoints

These flows are not SEO landing pages and do not need search crawler access.

## Necessary Code Changes

### 1. Maintain A Route Classification In Code And Architecture Notes

Create and maintain a route inventory with three groups:

- SEO crawlable public pages
- public but non-indexable utility files and APIs
- sensitive action routes

For Plantour, the first draft should look like this:

- SEO crawlable: public SSR pages, landing pages, trip pages, destination pages, public static assets
- utility but crawl-safe: `robots.txt`, `sitemap.xml`, manifest, public static media
- sensitive: auth, temporary-user, contact submit, refresh-token, invitation, profile mutation, social sign-in posts

Reason:

- anti-bot code must target route groups, not the whole application

### 2. Keep Public SSR Rendering Reachable

For public SSR pages:

- do not require authentication
- do not require anti-bot challenge on page load
- do not block required render resources
- do not introduce bot checks that fail closed on first HTML response

Reason:

- SSR is often the exact HTML search engines need to process normally

### 3. Add Human Verification Only To Sensitive Forms

Add Turnstile or hCaptcha widgets only to forms such as:

- participant sign-in
- admin sign-in request
- create temporary user
- contact submit

Do not add challenge widgets to:

- normal public content page loads
- public article or landing page views
- SEO page rendering shell

Reason:

- challenge widgets on normal page views can interfere with crawling and hurt UX

### 4. Verify Challenge Tokens Server-Side

For every protected form submission:

- require a valid Turnstile or hCaptcha token
- verify it server-side
- reject missing, expired, reused, or invalid tokens

Reason:

- client-only verification is not real protection
- this does not affect SEO because it is applied to sensitive actions, not crawlable content pages

### 5. Add App-Level Throttling Only To Sensitive APIs

Add throttling in ASP.NET for:

- sign-in endpoints
- token endpoints
- contact submission
- temporary-user creation

Do not throttle:

- normal crawlable page responses globally
- `robots.txt` or `sitemap.xml`
- public static resources globally

Reason:

- app throttling should back up edge controls, not interfere with crawling

### 6. Add Enumeration Protection To Public Account-State Endpoints

For endpoints such as `is-user-temporary`:

- reduce or remove anonymous exposure if possible
- return low-information responses
- add strict rate limits

Reason:

- this improves security without touching SEO pages

### 7. Add Honeypots And Submission Timing Checks To Forms

Use these only on form submissions, not on page views.

Good targets:

- contact form
- temporary-user creation
- any future self-service signup

Reason:

- this adds friction to bots without affecting search indexing

### 8. Keep Response Codes Clean For Public Pages

For crawlable public pages, avoid accidental:

- `403` from over-broad bot rules
- `429` from over-broad rate limits
- `503` during normal crawling windows unless maintenance is intentional

Reason:

- search engines treat these signals seriously

### 9. Use `noindex` For Non-SEO Pages Instead Of Anti-Bot Blocking

For pages that should not appear in search:

- use `noindex` where appropriate
- keep access control and auth for truly private pages
- do not try to solve indexing goals by challenging search bots

Reason:

- indexing control and bot control are different problems

### 10. Keep `robots.txt` And Sitemap Behavior SEO-Safe In Code Or Content Configuration

Rules:

- allow crawl access to public pages that should rank
- do not block CSS or JS needed to render public pages
- do not use `robots.txt` as a security mechanism
- keep `sitemap.xml` publicly reachable and challenge-free

Optional AI crawler policy:

- if Plantour wants to publicly signal that certain AI crawlers should not crawl the site, add explicit `robots.txt` directives for those user agents
- this can make sense for compliant crawlers such as `GPTBot` or `ChatGPT-User`
- treat this as a policy statement only, not as meaningful protection against unauthorized automation or browser-based testing

Example:

```txt
User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /
```

Reason:

- Google treats `robots.txt` as crawl guidance, not access control
- blocking render-critical assets can make pages harder for Google to understand
- AI-specific `robots.txt` directives may reduce compliant crawler traffic, but they will not stop malicious bots or scripted browser automation

### 11. Log Bot-Relevant Decisions In Application Code

Track separately:

- crawlable public GET requests
- sensitive POST requests
- challenge passes and failures
- app throttling decisions
- suspicious account-state lookups

Reason:

- if SEO traffic drops or abuse rises, application logs need to show which layer made the decision

## Recommended Implementation Order

### Step 1

Add challenge widgets to sensitive forms only, not to normal page views.

### Step 2

Add server-side token verification for those forms.

### Step 3

Add app-level throttling only to sensitive APIs.

### Step 4

Reduce anonymous exposure and enumeration value on account-state endpoints.

### Step 5

Add honeypots and submission timing checks to abuse-prone forms.

### Step 6

Review public SSR and public responses to ensure no accidental crawl-blocking behavior exists.

## Things To Avoid

Do not do these if you want normal SEO processing:

- challenge every visitor on first page load
- add anti-bot logic to the normal public page rendering shell
- throttle all HTML pages globally
- block CSS, JS, or images needed for public page rendering
- use `robots.txt` as a security control
- put CAPTCHA on `robots.txt`, `sitemap.xml`, or normal page GET requests
- assume `robots.txt` entries for `GPTBot`, `ChatGPT-User`, or similar agents will protect the application from Codex-style testing or illegal bots

## Acceptance Criteria

The code-level implementation should be considered SEO-safe only when all of the following are true:

- public indexable pages render normally for search engines
- public CSS, JS, images, and sitemap files are reachable without challenge
- sensitive form submissions are protected by challenge and app-level rate limits
- anti-bot code is focused on abuse-prone endpoints, especially `POST` actions
- no public crawlable route returns accidental `403`, `429`, or `503` due to anti-bot logic

## Summary

The code-side version of SEO-friendly bot protection for Plantour is:

- keep public crawlable pages open
- add code protections only to sensitive forms and APIs
- preserve SSR and crawlable resources
- use `robots.txt` as policy, not as security

That gives useful application-level protection without preventing normal SEO processing.