# Plantour Bot Protection Plan

## Goal

Protect Plantour against unapproved automated activity, including:

- automated browsing and scripted flows driven by Playwright, Puppeteer, Selenium, Codex-like agents, or similar tooling
- fake user registrations and bulk temporary-account creation
- credential stuffing, password spraying, token replay, and abusive sign-in attempts
- contact-form spam and scraping of public endpoints
- abusive load that is not a classic DDoS, but still harms availability or pollutes data

This document focuses on best practices to implement in Plantour. It includes code-related controls, edge and hosting controls, and non-code operational actions.

## Important Reality Check

There is no reliable way to block only tools named Playwright, Puppeteer, Codex, or similar by checking `User-Agent` alone. Attackers and generic automation frameworks can spoof headers easily.

The right goal is:

- make unauthorized automation expensive and unreliable
- make sensitive flows require proof of humanness and proof of legitimacy
- detect abuse early at the edge
- rate limit and challenge suspicious traffic before it reaches Render and the API
- log enough signals to react quickly without blocking legitimate users

In other words, protect behavior and risk patterns, not product names.

## Public Plantour Endpoints That Should Be Treated As High Risk

Based on the current server controller surface, the first endpoints to protect are:

- `POST /api/users/admin/send-signin-email`
- `POST /api/users/admin/signin-token`
- `POST /api/users/admin/social/signin`
- `POST /api/users/participant/signin`
- `POST /api/users/create-temporary-user`
- `POST /api/users/contact/submit`
- `POST /api/users/refresh-token`
- `GET /api/users/is-user-temporary?email=...`

Why these matter:

- sign-in endpoints are the main target for credential stuffing, token abuse, and headless testing
- temporary-user creation can be abused for fake-account farming or traffic amplification
- contact submission is a classic spam target
- refresh-token endpoints are high-value for replay and session abuse
- `is-user-temporary` may allow user or email-state enumeration if left unprotected

## Recommended Protection Strategy

Use a layered model. No single control is enough.

### Layer 1: Put Cloudflare in Front of the Public Plantour Domains

This should be the primary edge-control layer.

Recommended setup:

1. Keep Render as the origin host.
2. Put the production custom domain behind Cloudflare.
3. After Render validates the custom domain and issues certificates, switch Cloudflare DNS records from `DNS only` to `Proxied`.
4. Enable Cloudflare WAF and bot protections on the proxied zone.

Why:

- Render includes DDoS protection, but that mainly covers volumetric network abuse
- Cloudflare provides app-layer challenge, bot screening, rate limiting, and better abuse handling for login and signup traffic
- stopping bad traffic at the edge is cheaper and safer than letting it reach ASP.NET endpoints

### Layer 2: Protect Sensitive Flows With Turnstile or hCaptcha

Protect these flows first:

- participant sign-in
- admin email sign-in request
- admin token sign-in
- admin social sign-in
- create temporary user
- contact submit
- any future self-service signup or invite-acceptance flows

Best practice:

- use a modern challenge service such as Cloudflare Turnstile or hCaptcha
- validate tokens server-side on every protected request
- make tokens one-time, short-lived, and bound to the expected action
- do not trust client-only completion state

Recommendation for Plantour:

- if Cloudflare will already sit in front of the site, prefer Turnstile first because it integrates well with Cloudflare WAF and can issue `cf_clearance` cookies
- if you do not want to depend on Cloudflare widgets, hCaptcha is a strong alternative and supports explicit server-side verification

### Layer 3: Add Targeted Rate Limits

Rate limiting should exist at two levels:

- edge rate limiting in Cloudflare
- application-level throttling in the API for defense in depth

Targeted limits should be created per endpoint group, not one global limit for the whole site.

Suggested policy shapes:

- sign-in request limits by IP and by account identifier
- signup or temporary-account creation limits by IP, by browser fingerprint, and by email domain pattern
- contact form limits by IP, by session, and by fingerprint
- refresh-token limits by token family, session, and IP
- enumeration-sensitive endpoints such as `is-user-temporary` should be limited aggressively or removed from public anonymous access

Use both short and long windows:

- burst limits for rapid attack spikes
- rolling limits for slow bot abuse spread over time

### Layer 4: Risk-Based Challenges Instead of Always Challenging Everyone

This is usually the best balance between security and user friction.

Recommended behavior:

- allow normal low-risk traffic
- challenge suspicious traffic
- block obviously abusive traffic
- step up to stronger verification for higher-risk events

Signals that should raise risk:

- repeated failed sign-ins
- many accounts from one IP or one fingerprint
- headless-browser indicators
- datacenter or proxy IP reputation
- disposable email usage
- impossible request cadence for a human
- repeated temporary-user creation
- multiple token refreshes in abnormal patterns
- unusual geo, ASN, or device changes for the same account

### Layer 5: Detect Fake Registrations and Disposable Emails

For fake-account prevention, CAPTCHA alone is not enough.

Recommended controls:

- verify email ownership before the account becomes usable
- block or challenge disposable email domains
- score email risk, especially random-looking usernames and suspicious domains
- require invitation or approval for privileged or paid flows
- slow down or reject multiple accounts from the same fingerprint or IP over a short period
- require stronger verification for first high-value action, not only at signup

If Cloudflare Bot Management Enterprise becomes available, Account Abuse Protection is especially relevant because it can identify bulk account creation patterns and disposable-email risk at the edge.

### Layer 6: Make Automation Harder Even When It Uses a Real Browser

You cannot depend on blocking headless browsers by signature alone. Mature bots can look like real browsers.

Add friction that honest users pass easily but automation must actively solve:

- challenge-protected sensitive forms
- CSRF protection and single-use server-issued nonces on critical actions
- short-lived action tokens tied to exact routes and actions
- hidden honeypot fields on public forms
- minimum dwell-time checks on forms where a human normally needs at least a few seconds
- proof that JavaScript executed before sensitive anonymous requests are accepted
- strict replay prevention for sign-in tokens and refresh flows

These should be used carefully so accessibility is not harmed.

## What To Do At Cloudflare

This is the highest-value non-code protection area.

### Minimum Cloudflare Setup

- proxy the production domain through Cloudflare
- enable WAF
- enable Bot Fight Mode or Super Bot Fight Mode at minimum
- create rate limiting rules for login, token, temporary-user, and contact endpoints
- challenge suspicious requests to authentication and account-creation routes
- monitor bot analytics and security analytics weekly

### Better Cloudflare Setup

- deploy Turnstile on the high-risk forms
- enable Turnstile server-side verification
- enable Turnstile pre-clearance if using Cloudflare WAF challenges on the same zone
- add WAF custom rules that challenge or block risky traffic to sensitive endpoints
- use different rules for `challenge` versus `block` based on confidence and business impact

### Best Cloudflare Setup

If budget allows:

- upgrade to Cloudflare Bot Management
- use bot score fields, JA3 or JA4, verified bot signals, and security analytics
- evaluate Account Abuse Protection for signup and login abuse
- use fraud signals such as disposable email detection and email risk on signup flows
- label non-standard login or signup endpoints so Cloudflare account abuse features classify them correctly

### Cloudflare Rule Design For Plantour

Create separate rule groups for:

- admin sign-in
- participant sign-in
- social sign-in callbacks or posts
- temporary-user creation
- token refresh
- contact submission
- suspicious anonymous lookup endpoints

Preferred response order:

1. Log only
2. Managed challenge
3. Interactive challenge
4. Temporary block

Do not start with permanent hard blocks unless there is clear evidence of abuse.

## What To Do In Render

Render is not the main anti-bot layer, but there are still useful hosting actions.

### Render Actions To Take

- keep custom domains on Render, but place them behind Cloudflare proxy after certificate issuance
- keep health endpoints accessible and lightweight
- verify the health check path is narrow and does not trigger expensive work
- stream logs and metrics so abuse spikes are visible quickly
- configure notifications for restarts, deploy failures, and health-check failures
- review scaling and instance sizing so app-layer abuse does not take the site down too easily

### Render Capabilities And Limits

Render provides free DDoS protection using Cloudflare behind the scenes, which helps with network-level attack volume.

However:

- this does not replace bot management for signup or login abuse
- Render web-service inbound IP restrictions for public web apps require Enterprise org features
- if Plantour is not on Render Enterprise, assume Cloudflare in front of Render is the practical control point for public bot filtering

### Render-Specific Configuration Recommendations

- define and keep a dedicated health check endpoint that returns quickly
- make sure health checks remain reachable during maintenance mode
- avoid using expensive endpoints as health probes
- use environment separation so QA and production do not share anti-bot secrets, thresholds, or challenge keys
- keep challenge secrets and fraud-provider secrets only in Render environment variables, never in code or documents

## What To Do In The Application

No code changes are requested now, but this is the future implementation plan.

### Authentication And Session Flows

- add per-account and per-IP throttling to sign-in endpoints
- apply step-up challenge after repeated failed sign-ins
- return generic sign-in errors to avoid user enumeration
- enforce strict token expiry and one-time use for email sign-in tokens
- rotate refresh tokens and detect replay
- notify users about suspicious successful sign-ins or token events

### Signup And Temporary User Flows

- require challenge verification on temporary-user creation
- set quotas for temporary-user creation per IP, per device fingerprint, and per time window
- expire unused temporary users quickly
- add audit fields for origin IP, user agent, fingerprint, and referral context
- require stronger verification before a temporary user can perform any valuable action

### Contact Form And Public Form Flows

- use honeypot fields
- use rate limits
- reject obviously synthetic submission timing
- optionally require challenge only after suspicious volume starts, not necessarily for every visitor
- consider email-domain reputation checks if abuse becomes persistent

### Enumeration Protection

Endpoints like `is-user-temporary` can leak information useful to bots.

Best practice:

- avoid exposing account-state checks anonymously when possible
- if the endpoint must remain public, rate limit aggressively and return low-information responses
- monitor repeated requests for many different emails from the same IP or fingerprint

### Observability

For each protected endpoint, log at least:

- timestamp
- route
- result status
- IP address
- forwarded IP headers as received from the edge
- user agent
- challenge result
- failure reason category
- account identifier hash if applicable
- fingerprint or session identifier if used

This is necessary to tune thresholds instead of guessing.

## What Not To Rely On

These are weak or incomplete controls on their own:

- blocking by `User-Agent` strings such as `Playwright`, `Puppeteer`, or `HeadlessChrome`
- `robots.txt`
- one global rate limit for the whole site
- CAPTCHA without server-side verification
- IP blocking alone
- account lockout alone
- secret URLs for public endpoints

They can still help as minor supporting controls, but not as the main defense.

## Non-Code Operational Actions

These actions matter and should be part of the rollout.

### 1. Publish A Security And Testing Policy

Add a public page or contact note stating:

- unauthorized automated testing is not permitted
- load testing, scraping, or security testing requires prior written approval
- provide a security contact email
- provide a process for responsible disclosure

This will not stop criminals, but it gives you a clear basis for support responses, abuse reports, and provider escalations.

### 2. Prepare An Abuse Response Runbook

Document:

- who checks alerts
- which Cloudflare rules can be tightened quickly
- which Render dashboards and logs to inspect
- when to challenge, when to block, and when to leave traffic logged only
- how to temporarily enable maintenance mode if abuse is severe

### 3. Protect Secrets And Anti-Bot Keys

- keep Turnstile, hCaptcha, or reCAPTCHA secrets in environment variables only
- separate dev, QA, and production keys
- rotate keys after any suspected exposure
- never store live secrets in repo files or in general project notes

### 4. Coordinate With Email And Payment Providers

If fake registrations affect invitations, sign-in emails, or monetization:

- configure provider-side alerting for abnormal send spikes
- suppress repeated sends to obviously abusive targets
- rate limit sign-in email generation
- for billing or trial abuse, add manual review or delayed activation for risky accounts

### 5. Monitor Analytics Regularly

Review weekly at minimum:

- top attacked endpoints
- solve rates for challenge widgets
- sign-in failure trends
- temporary-user creation spikes
- contact spam spikes
- IP and ASN concentration
- datacenter versus residential traffic mix

## Recommended Rollout Order

### Phase 1: Highest Impact, Lowest Risk

- put production domain behind Cloudflare proxy
- enable WAF and bot protections
- add Cloudflare rate limits for the high-risk routes
- add Turnstile or hCaptcha on contact submit and temporary-user creation
- add logging and dashboards for auth and anonymous-public routes

### Phase 2: Authentication Hardening

- protect participant and admin sign-in flows with adaptive challenge
- implement generic auth failure responses
- add per-account and per-IP throttling
- harden refresh-token replay detection
- reduce information leakage on anonymous lookup endpoints

### Phase 3: Abuse Intelligence

- add disposable-email detection
- add device or browser fingerprinting with privacy review
- add step-up verification for high-risk sessions
- evaluate Cloudflare Bot Management and Account Abuse Protection if abuse volume justifies cost

## Practical Recommendation For Plantour

If only one approach is chosen now, do this:

1. Put the production domain behind Cloudflare.
2. Enable Cloudflare WAF, Super Bot Fight Mode, and rate limiting.
3. Add Turnstile to `participant/signin`, `create-temporary-user`, and `contact/submit` first.
4. Verify Turnstile tokens server-side on every protected request.
5. Add aggressive logging for `admin/send-signin-email`, `participant/signin`, `create-temporary-user`, `refresh-token`, and `is-user-temporary`.

That gives the best security return for the least implementation complexity.

## Acceptance Criteria For The Future Implementation

The bot-protection work should be considered complete only when:

- the production domain is protected at the edge before traffic reaches Render
- sensitive anonymous flows require valid server-verified challenge tokens or equivalent proof
- sign-in, signup, temporary-user, and contact routes all have route-specific rate limits
- replayable tokens are short-lived and invalidated on use
- suspicious activity is visible in logs and alerts within minutes
- fake-account creation is measurable and declining
- no control depends only on `User-Agent` matching

## Source Guidance Reviewed

- OWASP Authentication Cheat Sheet
- OWASP Credential Stuffing Prevention Cheat Sheet
- OWASP Denial of Service Cheat Sheet
- Cloudflare bot solutions documentation
- Cloudflare rate limiting rules documentation
- Cloudflare Turnstile documentation
- Cloudflare Turnstile pre-clearance documentation
- Cloudflare Account Abuse Protection documentation
- hCaptcha developer documentation
- Google reCAPTCHA v3 documentation
- Render DDoS protection documentation
- Render health checks documentation
- Render inbound IP rules documentation
- Render Cloudflare DNS configuration documentation

## Final Recommendation

For Plantour, the best-practice architecture is:

- Cloudflare in front of Render for the public domain
- Turnstile or hCaptcha on the highest-risk public actions
- per-route rate limits at the edge and in the API
- email and signup abuse controls beyond CAPTCHA
- strong logging, alerting, and an abuse-response playbook

That is the practical way to reduce unauthorized automation from Codex-like agents, browser automation frameworks, and illegal bot traffic without depending on brittle signature-based blocking.