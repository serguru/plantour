# SEO-Friendly Bot Protection For Plantour: Management And Platform Actions

## Goal

List the non-code actions needed to protect Plantour from abusive bots without hurting normal SEO crawling, rendering, indexing, or ranking.

This document focuses on Cloudflare, Render, SEO operations, monitoring, rollout, and process decisions.

## Core Rule

Protect sensitive actions, not normal crawlable content.

That means:

- public marketing and landing pages should remain crawlable
- public trip or destination pages meant for search traffic should remain crawlable
- `robots.txt`, `sitemap.xml`, canonical pages, CSS, JS, images, and other render-critical assets should remain crawlable
- sign-in, token, contact-submit, temporary-user, refresh-token, and similar abuse-prone endpoints should receive the strongest anti-bot controls

## What Must Stay SEO-Safe

These areas should not require CAPTCHA, challenge, login, or aggressive bot filtering for verified search engines:

- public HTML pages intended for Google and Bing indexing
- `robots.txt`
- `sitemap.xml` and sitemap index files
- canonical URLs
- CSS, JS, fonts, and images required for rendering indexed pages
- SSR responses for public pages

If Google cannot fetch those resources normally, indexing quality can drop.

## Management And Platform Actions

### 1. Mark Which Pages Must Be Indexable

Action type: SEO and content management

Define explicitly which pages should be indexed.

Examples:

- homepage
- public feature pages
- public plan pages
- public trip content meant for acquisition

Also define which pages should not be indexed:

- login page
- private dashboards
- invite-only pages
- test pages
- preview pages
- internal utilities

Reason:

- if indexing intent is unclear, teams often apply bot or noindex rules too broadly later

### 2. Put Cloudflare In Front Of The Production Domain

Action type: infrastructure management

Steps:

1. Keep Render as the origin.
2. Add the production custom domain in Render.
3. In Cloudflare DNS, point the custom domain to the Render hostname.
4. Start with `DNS only` until Render certificate validation completes.
5. After certificate issuance, switch the records to `Proxied`.

Reason:

- Cloudflare becomes the main place to stop abuse before it reaches Render
- done correctly, this does not hurt SEO

### 3. Do Not Put A Global Challenge On The Entire Zone

Action type: Cloudflare management

Do not create a rule that challenges all visitors for all HTML pages.

Avoid:

- global managed challenge for all requests
- global JavaScript challenge for all public page views
- global CAPTCHA for unknown visitors on HTML pages

Reason:

- this can reduce crawling, rendering, and indexing quality

### 4. Keep Verified Bots Out Of Aggressive Cloudflare Rules

Action type: Cloudflare management

When building Cloudflare WAF or rate-limit rules:

- exclude verified bots where appropriate for public crawlable routes
- do not rate limit verified bots on SEO pages unless there is a specific crawl-load reason
- if you must rate limit some public resources, do it carefully and test in Search Console

Reason:

- Cloudflare explicitly warns that applying rate limits to verified bots can affect SEO

### 5. Create Route-Specific WAF Rules

Action type: Cloudflare management

Create separate rules for:

- login and sign-in routes
- token routes
- contact-submit routes
- temporary-user creation routes
- account enumeration-style routes

Recommended behavior:

- log low-confidence suspicious traffic
- managed challenge medium-confidence suspicious traffic
- interactive challenge high-confidence suspicious traffic
- temporary block obvious abuse

Reason:

- route-specific rules protect abuse targets without touching SEO pages

### 6. Create Route-Specific Rate Limits

Action type: Cloudflare management

Add rate limits only for sensitive endpoints and mainly for `POST` actions.

Start with:

- participant sign-in
- admin sign-in initiation
- admin token sign-in
- temporary-user creation
- contact submit
- refresh-token

Do not apply the same rule to:

- homepage
- public page rendering routes
- sitemap or robots
- CSS, JS, or image asset paths

Reason:

- rate limiting public content routes is where SEO damage usually starts

### 7. Prefer Challenge On POST Flows, Not On Crawlable GET Pages

Action type: Cloudflare management

Best practice:

- keep `GET` public content pages accessible
- challenge the sensitive `POST` action that submits login, registration, contact, or token requests

Reason:

- search crawlers mostly need crawlable `GET` content and render resources, not protected user action posts

### 8. Keep Turnstile Pre-Clearance Optional And Limited To Protected Flows

Action type: Cloudflare management

If using Turnstile pre-clearance:

- use it to improve UX for protected flows after a visitor passes the challenge
- do not redesign the whole public site around challenge cookies

Reason:

- pre-clearance is helpful for auth and form flows, not necessary for basic SEO pages

### 9. Keep `robots.txt` Small And Correct

Action type: SEO management

Rules:

- allow crawl access to public pages that should rank
- do not block CSS or JS needed to render public pages
- do not use `robots.txt` as a security mechanism
- use it only for crawl management, not for protecting secrets

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

### 10. Keep `sitemap.xml` Publicly Reachable

Action type: SEO management

Make sure:

- sitemap URLs are reachable without challenge
- sitemap only lists canonical, indexable URLs
- sitemap is not rate limited or blocked

Reason:

- search engines use sitemap discovery as part of normal crawling

### 11. Keep Public Render Infrastructure SEO-Safe

Action type: Render and infrastructure review

For public SSR and public site delivery:

- do not require authentication at the edge for public pages
- do not apply anti-bot challenge to the first public HTML response
- keep required render resources reachable
- keep health and delivery configuration separate from anti-bot decisions

Reason:

- public rendering and platform routing need to stay stable for search crawling

### 12. Log Bot Decisions Separately For SEO Routes And Sensitive Routes

Action type: platform and observability work

Track separately:

- crawlable public GET requests
- sensitive POST requests
- challenge passes and failures
- WAF blocks and rate limits
- verified bot traffic versus unverified traffic

Reason:

- if SEO traffic drops, you need to know whether a bot rule caused it

### 13. Verify Googlebot Before Manual Blocking

Action type: ops procedure

If traffic claims to be Googlebot but looks suspicious:

- verify it by reverse DNS and forward DNS lookup
- or compare IPs with Google-published crawler ranges

Reason:

- bad actors can spoof `User-Agent`
- blocking real Googlebot hurts SEO; blocking fake Googlebot does not

### 14. Test In Google Search Console After Every Anti-Bot Change

Action type: SEO operations

After Cloudflare or platform anti-bot changes:

- test important URLs with URL Inspection
- confirm rendered HTML is still accessible
- confirm robots and sitemap are reachable
- monitor crawl stats and indexing over the next days

Reason:

- this is the fastest way to catch SEO regressions from security rules

### 15. Roll Out Bot Rules In Stages

Action type: Cloudflare and ops management

Rollout order:

1. Log only
2. Managed challenge on sensitive endpoints
3. Stronger challenge on proven abuse targets
4. Temporary block only after confirming false positives are low

Reason:

- staged rollout reduces the chance of accidental crawler blocking

## Recommended First Implementation Order For Plantour

### Step 1

Put the production custom domain behind Cloudflare after Render certificate validation is complete.

### Step 2

Create a clear allowlist concept for SEO routes:

- homepage and public landing routes
- public SSR content routes
- `robots.txt`
- `sitemap.xml`
- render-critical assets

### Step 3

Create Cloudflare WAF and rate-limit rules only for:

- `/api/users/admin/send-signin-email`
- `/api/users/admin/signin-token`
- `/api/users/admin/social/signin`
- `/api/users/participant/signin`
- `/api/users/create-temporary-user`
- `/api/users/contact/submit`
- `/api/users/refresh-token`

### Step 4

Exclude verified bots from any rule that could touch public SEO pages.

### Step 5

Keep `robots.txt`, `sitemap.xml`, and render-critical resources challenge-free.

### Step 6

Test in Search Console and watch crawl metrics after each rollout stage.

## Things To Avoid

Do not do these if you want normal SEO processing:

- challenge every visitor on first page load
- apply one global rate limit to all HTML pages
- rate limit verified bots on public SEO routes
- block CSS, JS, or images needed for public page rendering
- use `robots.txt` as a security control
- put CAPTCHA on `robots.txt`, `sitemap.xml`, or normal page GET requests
- block traffic just because the `User-Agent` says `HeadlessChrome` without checking route context and false-positive risk
- assume `robots.txt` entries for `GPTBot`, `ChatGPT-User`, or similar agents will protect the application from Codex-style testing or illegal bots

## Acceptance Criteria

The management-side implementation should be considered SEO-safe only when all of the following are true:

- Google and Bing can fetch public indexable pages normally
- public CSS, JS, images, and sitemap files are reachable without challenge
- verified bots are not accidentally challenged on crawlable public routes
- Cloudflare rules are focused on abuse-prone endpoints, especially `POST` actions
- Search Console shows no new crawl blockage caused by the rollout

## Summary

The management-side version of SEO-friendly bot protection for Plantour is:

- keep public crawlable pages open
- use Cloudflare and Render settings narrowly and intentionally
- make Cloudflare rules route-specific
- exempt verified bots where needed
- test every rollout in Search Console

That gives strong edge and process-level protection without preventing normal SEO processing.