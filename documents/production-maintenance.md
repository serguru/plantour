# Plantour Production Maintenance Plan

This document explains how to:

1. start Plantour production in Render for the first time in maintenance mode;
2. test the real production environment while the public sees a maintenance page;
3. temporarily switch production into maintenance mode later;
4. switch production back to public mode without unnecessary SEO risk.

This plan assumes:

- Plantour frontend is deployed as a Render web service;
- Plantour backend API is deployed as a Render web service;
- PostgreSQL is the production database;
- Cloudflare is used for DNS and edge protection;
- the production website must remain SEO-safe during temporary maintenance;
- no project code changes are requested in this document.

## 1. Main Principle

Do not stop the production services to perform maintenance.

Instead:

1. keep the frontend, backend, and database running;
2. return a proper `503 Service Unavailable` response for public traffic;
3. show the public a simple page like `Sorry, under maintenance, back soon`;
4. keep a private admin-only path to the real production frontend and API;
5. keep the production database accessible to you through secure admin access;
6. keep health checks and required webhooks working.

This approach is the safest one for your case because it satisfies all of these at the same time:

- the public does not use the app during maintenance;
- Google sees a temporary outage, not a removed site;
- you can test the real production stack;
- third-party integrations can still be validated.

## 2. SEO Rules You Must Follow

If the public site is under maintenance for a short period, use these rules.

### Required

1. Public HTML pages must return HTTP `503`.
2. Add a `Retry-After` header.
3. Keep `robots.txt` reachable.
4. Keep `sitemap.xml` reachable if possible.
5. Restore normal `200` responses as soon as production is ready.

### Do Not Do This

1. Do not return `200 OK` with a maintenance message.
2. Do not redirect every page to a maintenance URL with `302` or `307`.
3. Do not put `noindex` on the temporary maintenance page.
4. Do not fully shut the site down if you want to preserve SEO.
5. Do not leave the site in maintenance mode longer than necessary.

### About The 7-Day Window

A temporary `503` is the correct signal for search engines. It tells crawlers the outage is temporary.

However:

- there is no guaranteed universal promise that 7 full days has zero SEO impact;
- a short temporary outage is normal and usually safer than returning the wrong status code;
- the longer the outage, the higher the risk of crawl slowdown and eventual index effects;
- therefore, keep the maintenance period as short as possible even if several days are technically manageable.

## 3. The Best Production Topology

Use separate public and private hostnames.

### Public hostnames

1. `plantour.app` or `www.plantour.app`
   - used by public visitors and search engines;
   - during maintenance returns the maintenance page with `503`.

2. `api.plantour.app`
   - used by public frontend and integrations;
   - during maintenance blocks normal user traffic, but should still allow required system routes.

### Private hostnames

1. `admin.plantour.app`
   - private frontend entry point for you only;
   - always shows the real production frontend.

2. `api-admin.plantour.app`
   - private backend entry point for you only;
   - always shows the real production backend API.

### Why this is better than relying only on a tunnel

This is the preferred model because:

1. it gives you stable HTTPS production URLs;
2. it lets you test cookies, redirects, callbacks, CORS, and SSL exactly as production uses them;
3. it keeps the public blocked while you still work inside production;
4. it is cleaner and more repeatable than ad hoc tunnel use.

A tunnel may still be kept as an emergency fallback, but it should not be the main operational path.

## 4. Best Access Control For Private Production Access

Use Cloudflare Access for the private hostnames.

### Recommended setup

1. Put the public production domains behind Cloudflare proxy.
2. Create private admin hostnames such as `admin.plantour.app` and `api-admin.plantour.app`.
3. Protect those hostnames with Cloudflare Zero Trust Access.
4. Allow only your own email identity or your small admin group.
5. Optionally restrict by IP and country as an extra control.

### Why this is the right approach

This gives you:

- access to the real production app while the public is blocked;
- identity-based access control;
- no need to expose an open hidden production URL;
- clean repeatable operations for future maintenance windows.

## 5. What Must Stay Reachable During Maintenance

These routes must remain reachable even when maintenance mode is enabled.

### Always keep reachable

1. frontend health endpoint;
2. backend health endpoint;
3. `robots.txt`;
4. `sitemap.xml`;
5. payment provider webhooks;
6. email provider webhooks if applicable;
7. private admin hostnames;
8. database admin access for you.

### Why this matters

If health checks fail, Render may think your service is unhealthy.

If webhooks fail, you can lose or delay important provider events from services such as:

- Brevo;
- Paddle;
- Stripe;
- Cloudflare;
- GitHub webhooks if used in your flow.

## 6. First Production Deployment In Maintenance Mode

Follow this sequence.

### Phase A. Prepare the production environment

1. Create the production PostgreSQL database.
2. Configure automated backups.
3. Create the production DB user and store credentials securely.
4. Apply the production schema.
5. Verify direct DB connectivity from your secure admin machine.

6. Create the production backend service in Render.
7. Add all production environment variables.
8. Configure the backend health check path.
9. Attach the public API custom domain.
10. Attach the private admin API custom domain.

11. Create the production frontend service in Render.
12. Add all production environment variables.
13. Configure the frontend health check path.
14. Attach the public frontend custom domain.
15. Attach the private admin frontend custom domain.

16. In Cloudflare, point public and private DNS records to Render.
17. Wait until Render certificates and Cloudflare DNS are valid.
18. Confirm SSL works for all planned domains.

### Phase B. Enable maintenance mode before public opening

1. Turn maintenance mode on for the public frontend.
2. Turn maintenance mode on for the public backend.
3. Confirm the public frontend shows `Sorry, under maintenance, back soon`.
4. Confirm the public frontend returns HTTP `503`.
5. Confirm the public backend blocks normal user traffic.
6. Confirm a `Retry-After` header is present.
7. Confirm health checks still return `200`.
8. Confirm `robots.txt` still returns `200`.
9. Confirm `sitemap.xml` still returns `200` if available.
10. Confirm required webhook endpoints are not blocked.

### Phase C. Protect private production access

1. Enable Cloudflare Access on `admin.plantour.app`.
2. Enable Cloudflare Access on `api-admin.plantour.app`.
3. Allow only your account or your approved admin identities.
4. Verify that a browser without Access approval cannot enter.
5. Verify that you can enter successfully after Access authentication.

### Phase D. Test the real production stack while public is blocked

Use the private hostnames for all application testing.

#### Frontend and API

1. Open the private production frontend.
2. Sign in.
3. Verify frontend pages render correctly.
4. Verify API calls go to the real production backend.
5. Verify access token and refresh token behavior.
6. Verify sign-out and session cleanup.

#### Database

1. Connect to the production DB using your secure admin tool.
2. Verify schema correctness.
3. Verify expected seed data or required reference data.
4. Verify read and write operations triggered by the app.
5. Verify backups or recovery points are configured.

#### GitHub and deployment flow

1. Verify Render is connected to the correct GitHub repository and branch.
2. Verify deploy hooks or auto deploy settings are what you expect.
3. Perform a controlled deploy.
4. Confirm the deployment succeeds while the public still sees maintenance.

#### Third-party integrations

1. Test Brevo email sending.
2. Test Paddle or Stripe callbacks and webhook delivery.
3. Test Cloudflare DNS and SSL behavior.
4. Test your own domain name.
5. Test any required payment return URLs.
6. Test provider credentials stored in production secrets.

#### Smoke test

At minimum test:

1. homepage render through the private frontend;
2. sign-in flow;
3. dashboard load;
4. one create operation;
5. one update operation;
6. one delete operation if safe;
7. file or PDF generation if relevant;
8. email send if relevant;
9. payment or billing flow if relevant;
10. logout.

### Phase E. Open production to the public

Only do this after all required tests pass.

1. Turn maintenance mode off for the public frontend.
2. Turn maintenance mode off for the public backend.
3. Confirm the public homepage now returns `200`.
4. Confirm key public pages return `200`.
5. Confirm private admin hostnames still work for your future use.
6. Purge Cloudflare cache if the maintenance page may be cached.
7. Re-check `robots.txt` and `sitemap.xml`.
8. Check canonical URLs and main public SEO pages.
9. Monitor logs and Search Console for the next 24 to 48 hours.

## 7. Future Temporary Maintenance Procedure

Use the same model every time.

### Before the maintenance window

1. Decide whether maintenance mode is actually needed.
2. If a normal deployment is enough, avoid maintenance mode.
3. If maintenance mode is needed, schedule the window.
4. Create a fresh DB backup.
5. Confirm private admin hostnames and Cloudflare Access still work.
6. Confirm required webhooks are exempted.
7. Confirm health endpoints are still lightweight and reachable.

### Enter maintenance mode

1. Enable maintenance mode on the public frontend.
2. Enable maintenance mode on the public backend.
3. Confirm public frontend returns `503`.
4. Confirm the public sees the maintenance message.
5. Confirm you can still enter through the private admin frontend.
6. Confirm you can still use the private admin API.
7. Confirm the production DB is reachable.

### Perform the maintenance work

Examples:

1. deploy a new application version;
2. update secrets;
3. change DNS or Cloudflare settings;
4. run DB scripts;
5. validate provider integrations;
6. run regression smoke tests.

### Exit maintenance mode

1. Disable maintenance mode on the public frontend.
2. Disable maintenance mode on the public backend.
3. Confirm public pages return `200`.
4. Confirm API works for normal users.
5. Purge Cloudflare cache if needed.
6. Monitor logs, metrics, and Search Console.

## 8. How To Test Production While It Is Closed To The Public

Use this checklist during maintenance mode.

### Infrastructure

1. Render service status;
2. Render deploy logs;
3. health check results;
4. DB connectivity;
5. DB backups;
6. SSL certificate status.

### App behavior

1. frontend SSR load;
2. API availability;
3. login;
4. refresh token behavior;
5. logout;
6. error handling;
7. PDF or file generation if relevant.

### Integrations

1. GitHub deployment path;
2. PostgreSQL read and write;
3. Brevo sending;
4. Paddle or Stripe payment flow;
5. Cloudflare DNS and proxy behavior;
6. custom domain callbacks;
7. webhook delivery and logs.

### SEO and public behavior

1. public homepage returns `503` during maintenance;
2. public maintenance page message is shown;
3. public `robots.txt` returns `200`;
4. public `sitemap.xml` returns `200` if available;
5. private admin URLs are not publicly accessible.

## 9. What To Do In Render

### Recommended Render setup

1. Use paid services for production, not free-tier services.
2. Keep QA separate from production.
3. Use manual production deploys until the first public opening is complete.
4. Keep a dedicated health endpoint for each service.
5. Do not use a heavy route as the health check path.
6. Store all secrets in Render environment variables.
7. Do not shut down the services for maintenance if SEO matters.

### Production services to have

1. production frontend Render service;
2. production backend Render service;
3. production PostgreSQL database;
4. optional background worker if the app needs one later.

## 10. What To Do In Cloudflare

### Public domains

1. Put the public domains behind Cloudflare proxy.
2. Keep DNS, SSL, and caching under control there.
3. Be careful not to cache the maintenance response too aggressively.

### Private domains

1. Create private admin DNS records.
2. Protect those records with Cloudflare Access.
3. Restrict access to your identity only.
4. Do not publish those links anywhere public.

### After reopening production

1. Purge cache if necessary.
2. Re-test the public homepage.
3. Re-test the main public pages.
4. Re-test `robots.txt` and `sitemap.xml`.

## 11. Tunnel Option

A tunnel can be used, but only as a secondary option.

### Acceptable use of a tunnel

1. emergency access if private admin hostnames fail;
2. one-time debugging;
3. temporary internal review.

### Why a tunnel should not be your main method

1. it is less stable operationally;
2. it is less clean than a private production hostname;
3. it is less suitable for repeatable maintenance procedures;
4. it makes real production URL and callback testing harder.

## 12. Recommended Final Operating Model

For Plantour, the practical long-term model should be this:

1. Public production frontend domain
   - normal mode: real site;
   - maintenance mode: `503` maintenance page.

2. Public production API domain
   - normal mode: real API;
   - maintenance mode: block normal user traffic, allow required system routes.

3. Private production frontend domain
   - always available for you;
   - protected by Cloudflare Access.

4. Private production API domain
   - always available for you;
   - protected by Cloudflare Access.

5. Production database
   - always running;
   - securely accessible for administration and verification.

This gives you:

- a safe first launch in maintenance mode;
- temporary future maintenance windows;
- production testing while the public is blocked;
- lower SEO risk than a hard outage;
- a repeatable operational process.

## 13. Minimal Deployment Day Checklist

### Before opening the public site

1. production DB created and backed up;
2. frontend deployed;
3. backend deployed;
4. public domains attached;
5. private admin domains attached;
6. Cloudflare configured;
7. maintenance mode enabled;
8. public domain returns `503`;
9. private admin domain works;
10. smoke tests pass.

### When opening the public site

1. maintenance mode disabled;
2. homepage returns `200`;
3. main public pages return `200`;
4. robots and sitemap verified;
5. payment and email integrations verified;
6. logs monitored.

### When doing maintenance later

1. backup first;
2. enable maintenance mode;
3. work through private admin access;
4. test;
5. disable maintenance mode;
6. purge cache if needed;
7. monitor logs.

## 14. Final Recommendation

If you want the safest and cleanest approach, do this:

1. deploy production services in Render;
2. keep them running during maintenance;
3. serve a public `503` maintenance page;
4. add `Retry-After`;
5. keep health checks, `robots.txt`, `sitemap.xml`, and required webhooks reachable;
6. access the real production app through private admin hostnames protected by Cloudflare Access;
7. use a tunnel only as emergency fallback, not as the main operating model.

That is the best operational answer for Plantour given your requirements.