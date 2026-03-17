# Plantour Production Launch Checklist

This checklist rewrites the original launch idea into a safer production sequence for Render + Cloudflare with lower SEO risk.

Use this checklist for the first public launch of Plantour.

## 1. Core Rules

1. Do not connect `plantour.app` to a generic Render placeholder page.
2. Do not assume Render UI maintenance mode is automatically SEO-safe.
3. Do not rely on a tunnel as the main way to access private production.
4. Prefer testing on Render hostnames first, or on a private/staging hostname you control.
5. Only connect `plantour.app` when the real app is deployed and working.
6. If the public domain is connected before public opening, the public site must return a proper `503` maintenance response.
7. Keep `robots.txt`, `sitemap.xml`, health checks, and required webhooks reachable.

## 2. Recommended Hostnames

Use this hostname model.

1. Public frontend: `plantour.app`
2. Public API path: `plantour.app/api`
3. Private frontend: `admin.plantour.app`
4. Private API path: `admin.plantour.app/api`
5. Optional pre-launch test hostname: `staging.plantour.app`
6. Optional pre-launch test API path: `staging.plantour.app/api`

Notes:

1. Plantour is currently hardcoded to use the same-origin API path model, so this checklist keeps `plantour.app/api`.
2. Because backend traffic must live under `/api`, you need routing or proxying that forwards `/api` requests to the backend Render service.
3. `admin.plantour.app` should also forward `/api` to the backend Render service.
4. `admin.plantour.app` should be protected with Cloudflare Access.
5. A tunnel may be kept only as an emergency fallback.

## 3. Prepare Render Services

1. Create a paid Render web service for the backend API.
2. Create a paid Render web service for the frontend Angular SSR app.
3. Create a paid Render PostgreSQL database.
4. Confirm backend, frontend, and database each have their Render service URLs.
5. Configure backend health check path.
6. Configure frontend health check path.
7. Keep automatic public opening disabled until you finish testing.

Stop here if any service cannot start correctly on its Render hostname.

## 4. Prepare Production Configuration

Backend configuration:

1. Prepare `appsettings.Production.json` with non-secret production settings only if needed.
2. Do not rely on uploading secrets inside the file.
3. Put real secrets into Render environment variables.

Frontend configuration:

1. Prepare production frontend environment values.
2. Put production secrets and sensitive runtime settings into Render environment variables where applicable.

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

1. Add database connection string.
2. Add JWT and auth settings.
3. Add Brevo configuration.
4. Add Paddle configuration.
5. Add Google and Facebook settings if used.
6. Add maintenance-mode related settings if your implementation uses them.
7. Add any production API base URLs and domain settings.

For the frontend Render service:

1. Add production frontend environment values.
2. Add production API base URL.
3. Add maintenance-mode related settings if your implementation uses them.
4. Add any production public URLs.

Do not continue until both services have the full production configuration.

## 6. Prepare The Database

1. Connect the production backend to the production PostgreSQL database.
2. Apply DB scripts to create the `plantour` schema.
3. Insert the required seed or reference data.
4. Verify the schema exists.
5. Verify the required initial data exists.
6. Confirm automated backups are enabled.

Stop here if schema creation, seed data, or backup setup fails.

## 7. Deploy To Render Hostnames First

1. Deploy the backend from GitHub Actions to the Render backend service.
2. Deploy the frontend from GitHub Actions to the Render frontend service.
3. Wait for both deployments to finish.
4. Open the backend Render hostname.
5. Open the frontend Render hostname.
6. Confirm the frontend Render hostname forwards `/api` to the backend correctly.
7. Confirm both services start successfully.
8. Confirm backend health check returns `200`.
9. Confirm frontend health check returns `200`.

This stage should happen before `plantour.app` is connected.

## 8. Test On Render Before Using Your Real Domain

1. Sign in through the temporary Render frontend hostname.
2. Verify the frontend can call the backend through the same-origin `/api` path.
3. Verify database reads and writes work.
4. Verify logout and session behavior.
5. Verify Brevo sending if applicable.
6. Verify Paddle or billing callbacks if applicable.
7. Verify any Google or Facebook auth redirect behavior.
8. Verify logs in Render.

If you find a serious issue here, you can stop backend and frontend safely because `plantour.app` is still not live.

## 9. Optional Better Pre-Launch Test: Use A Staging Hostname

If you want to test Cloudflare before the public launch, do this before connecting `plantour.app`.

1. Create `staging.plantour.app` in Cloudflare.
2. Point it to the frontend Render service.
3. Configure `/api` on `staging.plantour.app` to forward to the backend Render service.
4. Verify that `staging.plantour.app/api` reaches the backend correctly.
5. Verify SSL and proxy behavior.
6. Test Cloudflare plus Render together on staging.

This is better than testing only on `temporary.onrender.com` if you want to validate Cloudflare behavior early.

## 10. Prepare Private Production Access

1. Create `admin.plantour.app` in Cloudflare.
2. Point it to the frontend Render service.
3. Configure `/api` on `admin.plantour.app` to forward to the backend Render service.
4. In Cloudflare Zero Trust, protect `admin.plantour.app`.
5. Restrict it to your own identity or admin group.
6. Verify `admin.plantour.app` works.
7. Verify `admin.plantour.app/api` reaches the backend correctly.
8. Verify unauthenticated public visitors cannot access it.

This should replace tunnel-first testing as the main production access model.

## 11. Enable Maintenance Mode Before Public Domain Goes Live

This step applies if you connect the public domain before public opening.

1. Enable your app-level maintenance mode for the public frontend.
2. Enable your app-level maintenance mode for the public backend.
3. Confirm the public frontend returns HTTP `503`.
4. Confirm the public frontend sends `Retry-After`.
5. Confirm `plantour.app/api` returns `503` for normal public traffic.
6. Confirm `robots.txt` still returns `200`.
7. Confirm `sitemap.xml` still returns `200`.
8. Confirm frontend and backend health checks still return `200`.
9. Confirm required webhook endpoints still work.

Do not rely only on a generic Render maintenance page unless you have explicitly verified it behaves this way.

## 12. Connect The Real Public Domain

When Render-side testing is successful, connect the real production domain.

1. In Render, attach `plantour.app` to the frontend service.
2. Keep the backend Render service on its own Render hostname or another non-public backend hostname.
3. Configure routing or proxying so that `plantour.app/api` forwards to the backend service.
4. In Cloudflare, create or update the DNS record for `plantour.app`.
5. In Namecheap, confirm the domain is delegated correctly to Cloudflare if not already done.
6. Wait for DNS propagation.
7. Wait for SSL to become valid.
8. Confirm `plantour.app` resolves correctly.
9. Confirm `plantour.app/api` reaches the backend correctly.

If you connect the public domain before launch, keep maintenance mode on.

## 13. Test Again Through Private Access

After the public domain and Cloudflare are in place:

1. Access the app through `admin.plantour.app`.
2. Access the API through `admin.plantour.app/api`.
3. Repeat the core smoke tests.
4. Verify cookies, redirects, auth, and callbacks behave correctly under the real domain setup.
5. Confirm public visitors still see maintenance mode.

If you find a serious issue now:

1. If `plantour.app` is not yet connected, you can stop services without SEO concern.
2. If `plantour.app` is already connected, do not prefer stopping the services.
3. Prefer keeping services running and returning a proper `503` maintenance response while you fix the issue.
4. Stop services only if absolutely necessary.

## 14. Public SEO Safety Checks Before Opening

Before switching to normal public mode, verify all of these.

1. `https://plantour.app/robots.txt` returns `200`.
2. `https://plantour.app/sitemap.xml` returns `200`.
3. Public homepage returns `503` while maintenance is enabled.
4. `Retry-After` is present on the public maintenance response.
5. `https://plantour.app/api` is routed to the backend correctly.
6. Health endpoints return `200`.
7. Required webhooks are not blocked.
8. Private admin URLs are not public.

## 15. Open Production To The Public

Only do this when every required test has passed.

1. Disable maintenance mode for the public frontend.
2. Disable maintenance mode for the public backend.
3. Confirm the public homepage now returns `200`.
4. Confirm main public pages return `200`.
5. Confirm `plantour.app/api` works for normal users.
6. Confirm `robots.txt` still returns `200`.
7. Confirm `sitemap.xml` still returns `200`.
8. Purge Cloudflare cache if the maintenance page may be cached.
9. Review Render logs.
10. Review application logs.
11. Monitor search behavior and errors over the next 24 to 48 hours.

## 16. What To Do If Something Goes Wrong

Before `plantour.app` is connected:

1. Stop frontend and backend if needed.
2. Fix the issue.
3. Redeploy.
4. Retest.

After `plantour.app` is connected:

1. Keep services running if possible.
2. Keep public maintenance mode enabled.
3. Fix the issue while the public receives `503`.
4. Stop services only if you have no other option.

## 17. Final Evaluation Of The Original Idea

The original idea was close, but needed these corrections:

1. Testing on Render hostnames before connecting the real domain is good.
2. Using a tunnel as the main production access path is not ideal.
3. Using private Cloudflare-protected admin hostnames is better.
4. Uploading secrets through `appsettings.Production.json` is not the right production model.
5. Real secrets should live in Render environment variables.
6. Because Plantour is hardcoded to same-origin API routes, the public domain setup must also forward `/api` to the backend service.
7. Connecting the public domain should happen only after the real app is deployed and tested.
8. Once the public domain is connected, do not shut services down unless necessary; prefer a proper `503` maintenance response.

This is the corrected production launch checklist for Plantour.
