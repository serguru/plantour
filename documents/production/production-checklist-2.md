# Plantour Production Launch Checklist 2

This checklist uses the simplest production model supported by the official Render, Cloudflare, GitHub, and Google documentation.

The main simplification is this:

1. Use `plantour.app` for the frontend.
2. Use `api.plantour.app` for the backend.
3. Do not force backend traffic through `plantour.app/api` unless you intentionally want extra edge-routing complexity.

This keeps the launch path simpler and reduces SEO risk because you do not need custom proxy behavior just to make the site work.

## 1. Core Rules

1. Do not connect `plantour.app` until the real frontend is deployed and working.
2. Do not connect `api.plantour.app` until the real backend is deployed and working.
3. Do not point the public domain to a generic placeholder page.
4. Prefer testing on Render hostnames first.
5. Use Render environment variables for secrets.
6. Use the Render Postgres internal connection string from the backend service.
7. Keep `robots.txt`, `sitemap.xml`, health checks, and required webhook endpoints reachable.
8. Prefer keeping the public domain disconnected until launch instead of relying on a maintenance setup.

## 2. Recommended Hostnames

Use this hostname model.

1. Public frontend: `plantour.app`
2. Public API: `api.plantour.app`
3. Optional redirect hostname: `www.plantour.app`
4. Private frontend: `admin.plantour.app`
5. Optional staging frontend: `staging.plantour.app`
6. Optional staging API: `staging-api.plantour.app`

Notes:

There are 4 environments: dev, qa, pred-prod and production. Make sure for "production" and the rest the code correctly works with "X-Robots-Tag" in server.ts as well as properly deals with robots.txt and "Sitemap: https://plantour.app/sitemap.xml"


## 3. Prepare Render Services

1. Create a paid Render web service for the frontend Angular SSR app.
2. Create a paid Render web service for the backend API.
3. Create a paid Render PostgreSQL database.
4. Put frontend, backend, and database in the same Render region.
5. Record the frontend Render hostname.
6. Record the backend Render hostname.
7. Record the Postgres internal connection string.
8. Configure the frontend health check path.
9. Configure the backend health check path.

Stop here if any service does not start correctly on its Render hostname.

## 4. Prepare Production Configuration

Backend configuration:

1. Keep non-secret production settings in configuration files only if truly needed.
2. Put secrets in Render environment variables.
3. Set the production database connection to the Render Postgres internal URL.
4. Set all production callback URLs and webhook URLs.

Frontend configuration:

1. Set `clientUrl` to `https://plantour.app`.
2. Set `apiUrl` to `https://api.plantour.app`.
3. Set production Google, Facebook, and Turnstile public values if used.
4. Add temporary `noindex` protection for the Render hostname while prelaunch testing is in progress.
5. Keep sensitive runtime values out of source control.

Provider configuration to prepare:

1. PostgreSQL connection settings
2. Brevo settings
3. Paddle settings
4. Google auth settings
5. Facebook auth settings if used
6. Any webhook secrets
7. Any production callback URLs

Stop here if required production values are not ready.

## 5. Configure Render Environment Variables

For the backend Render service:

1. Add the production database connection string.
2. Add JWT and auth settings.
3. Add Brevo configuration.
4. Add Paddle configuration.
5. Add Google and Facebook settings if used.
6. Add any production domain settings.
7. Add any required webhook secret values.

For the frontend Render service:

1. Add production frontend environment values.
2. Set `clientUrl` to `https://plantour.app`.
3. Set `apiUrl` to `https://api.plantour.app`.
4. Add any public runtime values needed by the frontend.

Do not continue until both services have complete production configuration.

## 6. Prepare The Database

1. Create the production Render Postgres instance.
2. Connect the backend to it with the internal URL.
3. Apply DB scripts to create the `plantour` schema.
4. Insert required seed or reference data.
5. Verify the schema exists.
6. Verify the required initial data exists.
7. Confirm backups are enabled.

Stop here if schema creation, seed data, or backup setup fails.

## 7. Deploy To Render Hostnames First

1. Deploy the backend to its Render service.
2. Deploy the frontend to its Render service.
3. Wait for both deployments to finish.
4. Open the backend Render hostname.
5. Open the frontend Render hostname.
6. Confirm both services start successfully.
7. Confirm the frontend can call the backend using the configured API URL.
8. Confirm backend health checks return `200`.
9. Confirm frontend health checks return `200`.

This stage should happen before any public custom domain is connected.

## 8. Test On Render Before Using Your Real Domain

1. Sign in through the frontend Render hostname.
2. Verify API calls work.
3. Verify database reads and writes work.
4. Verify login, logout, and session behavior.
5. Verify Brevo sending if applicable.
6. Verify Paddle or billing callbacks if applicable.
7. Verify Google or Facebook auth behavior if applicable.
8. Verify logs in Render.

If you find a serious issue here, stop, fix it, redeploy, and retest. The public domain is still untouched.

## 9. Configure GitHub Production Deployment Controls

1. Create a `production` environment in GitHub.
2. Restrict deployment to the production branch or tag you actually use.
3. Require reviewer approval before production deployment.
4. Put production-only secrets in the GitHub environment if your workflows need them.
5. Use concurrency so only one production deployment can run at a time.
6. Prefer manual approval for first production releases.

This gives you a standard deployment gate without changing application code.

## 10. Connect Custom Domains In Render

When Render-side testing is successful, add custom domains in Render.

1. Attach `plantour.app` to the frontend service.
2. Attach `www.plantour.app` to the frontend service if you want it.
3. Attach `api.plantour.app` to the backend service.
4. Attach `admin.plantour.app` to the frontend service if you want private access.
5. Wait until Render shows the required DNS targets.

Do not rely on DNS alone. First add the custom domains in Render, then configure Cloudflare.

## 11. Configure Cloudflare DNS

1. Make sure the domain is managed in Cloudflare.
2. Remove any `AAAA` records for these Render hostnames if present.
3. Set Cloudflare SSL mode to `Full`.
4. Create a CNAME for `plantour.app` pointing to the frontend Render hostname.
5. Create a CNAME for `www.plantour.app` pointing to the frontend Render hostname if used.
6. Create a CNAME for `api.plantour.app` pointing to the backend Render hostname.
7. Create a CNAME for `admin.plantour.app` pointing to the frontend Render hostname if used.
8. Initially keep these records as `DNS only` until Render verifies the domains and issues certificates.
9. Verify the domains in the Render dashboard.
10. After certificates are valid, optionally switch Cloudflare proxying on.

Stop here if any custom domain does not verify correctly.

## 12. Optional Better Pre-Launch Test

If you want a final test before the public opening:

1. Attach `staging.plantour.app` to the frontend service.
2. Attach `staging-api.plantour.app` to the backend service.
3. Point both through Cloudflare.
4. Test SSL, redirects, cookies, auth, and API behavior through those hostnames.

This is cleaner than inventing path-based routing just for prelaunch testing.

## 13. Prepare Private Production Access

If you want private production access:

1. Attach `admin.plantour.app` to the frontend service.
2. Point it through Cloudflare.
3. Create a Cloudflare Access self-hosted application for `admin.plantour.app`.
4. Restrict it to your identity or admin group.
5. Verify authenticated access works.
6. Verify unauthenticated public visitors cannot access it.

This is the standard private-access pattern. A tunnel is optional, not the main approach.

## 14. Public SEO Safety Checks Before Opening

Before public launch, verify all of these on the real production domain.

1. Remove temporary `X-Robots-Tag: noindex, nofollow` headers from the public production hostname.
2. Remove temporary `<meta name="robots" content="noindex, nofollow">` from public HTML.
3. Remove any temporary `robots.txt` block such as `User-agent: *` and `Disallow: /`.
4. `https://plantour.app/robots.txt` returns `200`.
5. `https://plantour.app/sitemap.xml` returns `200`.
6. The public homepage returns `200`.
7. Main public pages return `200`.
8. `https://api.plantour.app` is reachable for the frontend.
9. Frontend and backend health endpoints return `200`.
10. Required webhooks are not blocked.
11. OAuth callback URLs use the correct production hostnames.
12. Private admin URLs are not open to the public.

The lowest SEO-risk move is to make the site public only when it already works.

## 15. Open Production To The Public

Only do this when every required test has passed.

1. Confirm `plantour.app` resolves correctly.
2. Confirm `api.plantour.app` resolves correctly.
3. Confirm SSL is valid for both hostnames.
4. Confirm login works.
5. Confirm database-backed actions work.
6. Confirm emails and billing integrations work.
7. Purge Cloudflare cache if needed.
8. Review Render logs.
9. Review application logs.
10. Monitor behavior and search signals over the next 24 to 48 hours.

## 16. What To Do If Something Goes Wrong

Before public domain cutover:

1. Stop and fix the issue.
2. Redeploy.
3. Retest on Render or staging hostnames.
4. Keep `plantour.app` disconnected until the issue is resolved.

After the public domain is live:

1. Prefer fixing forward while keeping services up.
2. Use rollbacks or redeploys if needed.
3. Avoid taking down `robots.txt` or `sitemap.xml`.
4. Avoid long periods of site-wide `503` responses.

## 17. Final Evaluation

This version is simpler because:

1. It uses standard custom domains instead of path-based origin routing.
2. It uses Plantour's existing `apiUrl` support instead of forcing `/api` same-origin.
3. It treats Render hostnames as the first safe test stage.
4. It uses Cloudflare mainly for DNS, TLS, proxying, and Access.
5. It uses GitHub environments and approvals for standard production release control.
6. It keeps the lowest SEO-risk strategy: do not expose the public domain until the actual app works.

This is the simpler production launch checklist for Plantour on Render and Cloudflare.


March 26 at 4:15PM 2 floor SaintPault CT scan