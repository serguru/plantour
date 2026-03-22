# Plantour Production Launch Checklist

Main steps
1. Create 3 paid Render services.
2. Deploy `pred-prod` to those services first.
3. Test the real production-grade infrastructure and external integrations while SEO is still limited by the `pred-prod` behavior.
4. Put Cloudflare in front of `plantour.app` to block public access.
5. Connect `plantour.app` to the existing paid services while access remains blocked.
6. Deploy the real `production` version from GitHub to those same paid services.
7. Test the production version on `plantour.app` while public access is still blocked.
8. Open the site to the public and to SEO only after production is verified.

## 1. Current Environment Behavior In Code

Plantour currently has 4 environments:
1. `development`
2. `qa`
3. `pred-prod`
4. `production`

Important behavior already present:
1. Frontend SSR in `src/server.ts` adds `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet` for every non-production environment.
2. Frontend `qa` and `pred-prod` builds publish a blocking `robots.txt` with `Disallow: /`.
3. Frontend `production` publishes a public `robots.txt` that allows crawling and includes `Sitemap: https://plantour.app/sitemap.xml`.
4. Backend `/sitemap.xml` is served only when `ASPNETCORE_ENVIRONMENT` resolves to `Production`.
5. Backend `/sitemap.xml` returning `404` in `pred-prod` is expected behavior.
6. Frontend `/health` already exists and should return `200`.

Because of that, `pred-prod` is suitable for private launch rehearsal on the real paid services without exposing the site to search engines.

## 2. Deployment Model
1. One paid Render frontend SSR service.
2. One paid Render backend API service.
3. One paid Render PostgreSQL database.
4. Deploy `pred-prod` to those services first.
5. Keep public access blocked during domain connection and production validation.
6. Reuse the same paid services for the final `production` deployment.

This avoids creating one full paid production stack later after `pred-prod` is already validated.

## 3. Phase 1: Create The 3 Paid Render Services

Create these services in Render:

1. Paid frontend SSR web service.
2. Paid backend API web service.
3. Paid PostgreSQL database.

Then:

1. Keep all 3 services in the same region.
2. Record the frontend Render hostname.
3. Record the backend Render hostname.
4. Record the database internal connection string.
5. Configure health check paths for frontend and backend.
6. Verify all 3 services start correctly.

Stop here if the base infrastructure is not healthy.

## 4. Phase 2: Configure Those Services For Pred-Prod

Configure the existing paid services for `pred-prod` first.

### Backend

1. Set `ASPNETCORE_ENVIRONMENT=Pred-Prod`.
2. Set the database connection string for the real production-grade database you want to validate.
3. Set Paddle, Brevo, auth, webhook, CORS, and callback values needed for the real integration test path.
4. Keep secrets in Render environment variables.

### Frontend

1. Build with the Angular `pred-prod` configuration.
2. Set `clientUrl` to the current private test URL you are using at that phase.
3. Set `api.baseUrl` to the backend service URL used for that phase.
4. Set `pred-prod` public auth and Turnstile values if used.
5. Confirm the `pred-prod` build keeps the SEO restrictions.

Stop here if the services are not fully configured for a real end-to-end test.

## 5. Phase 3: Deploy Pred-Prod To The Paid Services

1. Deploy the backend using the `Pred-Prod` environment.
2. Deploy the frontend using the Angular `pred-prod` build.
3. Wait for both deployments to finish.
4. Open the backend Render hostname.
5. Open the frontend Render hostname.
6. Confirm both services start successfully.
7. Confirm frontend `/health` returns `200`.
8. Confirm backend health checks return `200` if configured.
9. Confirm the frontend can call the backend successfully.

At this point, the paid services exist and are running the `pred-prod` version.

## 6. Phase 4: Test Actual Production Dependencies While Still In Pred-Prod

This is the core purpose of the `pred-prod` phase on the paid services.

Test against the actual infrastructure you intend to rely on for launch:

1. Test the actual production database connectivity and behavior.
2. Test the actual Paddle connectivity and callbacks if applicable.
3. Test the actual Brevo connectivity and email sending if applicable.
4. Test the actual Google or Facebook auth configuration if applicable.
5. Test the actual webhook flows and secrets.
6. Test the real CORS, callback, and redirect values.
7. Test important data writes and reads.
8. Test sign-in, sign-out, session behavior, and protected routes.
9. Review Render logs for both services.

Confirm the SEO restrictions remain active while doing this:

1. Confirm the response headers include `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet`.
2. Confirm `robots.txt` returns a blocking file with `Disallow: /`.
3. Confirm `/sitemap.xml` returns `404`.

If a serious issue appears here, fix it in `pred-prod`, redeploy to the same paid services, and retest.

## 7. Phase 5: Pred-Prod Exit Criteria On The Paid Services

Do not connect the public domain until all of these are true:

1. The app is complete enough to launch.
2. The paid services are stable.
3. The actual database behavior is validated.
4. The actual Paddle, Brevo, and other required integrations are validated.
5. The main user flows work.
6. The admin and operational flows work.
7. The team accepts the current deployed version as ready for production conversion.

Only after these pass should you move to the protected-domain phase.

## 8. Phase 6: Use Cloudflare To Block Public Access To Plantour.App

Before attaching the public domain, configure Cloudflare so the site is not publicly accessible.

Use Cloudflare protection for `plantour.app` before opening the domain:

1. Put the domain under Cloudflare management if it is not already there.
2. Prepare the DNS records needed for the frontend and backend services.
3. Configure a Cloudflare rule or access-control layer that blocks public access to `plantour.app` while you continue testing.
4. Make sure only you or the allowed admin identities can access the protected site.
5. Confirm search engines and public users cannot reach the protected site.

The goal of this phase is simple: the domain exists, but the public still cannot use it.

## 9. Phase 7: Connect Plantour.App To The Existing Paid Services

After Cloudflare protection is ready:

1. Attach `plantour.app` to the frontend Render service.
2. Attach `www.plantour.app` to the frontend Render service if you want it.
3. Attach `api.plantour.app` to the backend Render service.
4. Add the required DNS records in Cloudflare.
5. Keep the site protected from public access while Render verifies the domains and certificates.
6. Confirm the protected domain resolves correctly.

At the end of this phase, the real production hostnames are connected, but the public still cannot access them.

## 10. Phase 8: Deploy The Production Version From GitHub

Now reuse the same paid services and switch them from `pred-prod` to `production`.

1. Set the backend to `ASPNETCORE_ENVIRONMENT=Production`.
2. Apply the final production environment values.
3. Build and deploy the frontend using the Angular `production` configuration.
4. Deploy the backend production version from GitHub.
5. Confirm the same paid Render services are now running the `production` version.

This deployment removes the `pred-prod` SEO limits because the app is now running as `production`.

## 11. Phase 9: Test Production On Plantour.App While Still Protected

Test the real production version on the real production domain before public opening.

1. Open `https://plantour.app` through the Cloudflare protection layer.
2. Open `https://api.plantour.app` through the connected backend domain.
3. Confirm frontend and backend both start correctly.
4. Confirm frontend `/health` returns `200`.
5. Confirm backend health checks return `200` if configured.
6. Confirm the frontend can call the backend on the real production hostnames.
7. Confirm sign-in, sign-out, and session behavior work.
8. Confirm database-backed actions work.
9. Confirm Paddle, Brevo, auth, webhook, and callback flows still work.
10. Confirm the production frontend no longer sends the non-production `X-Robots-Tag` header.
11. Confirm `https://plantour.app/robots.txt` allows crawling and includes `Sitemap: https://plantour.app/sitemap.xml`.
12. Confirm `https://plantour.app/sitemap.xml` returns `200`.

If a serious issue appears here, keep Cloudflare protection in place, fix the issue, redeploy production, and retest.

## 12. Phase 10: Open Production Publicly Through Cloudflare

Only after all protected-domain production tests pass:

1. Remove or relax the Cloudflare protection blocking public access.
2. Confirm public visitors can access `https://plantour.app`.
3. Confirm search engines can access the production `robots.txt` and `sitemap.xml`.
4. Confirm `api.plantour.app` is reachable for the frontend.
5. Review Render logs.
6. Review application logs.
7. Monitor behavior during the first 24 to 48 hours.

This is the real public launch point.

## 13. If Something Goes Wrong

Before the public opening:

1. Keep Cloudflare protection enabled.
2. Fix the issue.
3. Redeploy to the same paid services.
4. Retest on the protected domain.
5. Do not open public access until the issue is resolved.

After the public opening:

1. Prefer fixing forward while keeping the site available.
2. Use redeploy or rollback if needed.
3. Avoid breaking `robots.txt` or `/sitemap.xml`.
4. Avoid long site-wide outages.

## 14. Final Evaluation

This checklist matches the intended process because:

1. It creates the 3 paid Render services up front.
2. It gives `pred-prod` a real role on those same paid services.
3. It validates the actual production-grade database and external integrations before public launch.
4. It connects `plantour.app` before the public opening, but keeps it protected.
5. It deploys the final `production` build only after the `pred-prod` validation stage succeeds.
6. It opens public and SEO access only after the real production domain has been fully tested.