# Render Production Steps

This document explains:

1. how Render's maintenance mode works, based on the official Render documentation;
2. what you can do on the Render side to protect SEO during maintenance;
3. step-by-step instructions for moving from QA to production in an SEO-safe way;
4. how to temporarily stop the website and start it again.

---

## 1. How Render Maintenance Mode Works

Source: https://render.com/docs/maintenance-mode

### What it is

Render has a built-in maintenance mode for paid web services.

When enabled, the service remains fully running, but Render intercepts every
incoming request from the public internet before it reaches your application.
Render responds to all those requests with `503 Service Unavailable` and
displays a maintenance page.

This is NOT a suspend or shutdown. Your application process keeps running.
Render just stops routing public internet traffic to it.

### How to enable and disable

1. Open the Render Dashboard.
2. Go to the service's Settings page.
3. Scroll down to the Maintenance Mode section.
4. Toggle the switch on. Confirm the dialog.

Maintenance mode takes effect immediately. Disable it the same way — toggle
the switch off.

### What the public sees

By default, Render shows its own default maintenance page. You can set a custom
maintenance page URL in the same settings section.

Rules for the custom maintenance page:

- The URL must point to a page hosted on a different service, not the service
  in maintenance mode. A static site on Render works well.
- If the URL returns an error, Render returns that error to visitors.
- Render still returns `503` regardless of what the custom page displays.

### What stays accessible during maintenance mode

The service is unreachable from the public internet. However:

- The service is still reachable via **Render's private network** (connections
  from other services in the same private network).
- The service is still reachable via **SSH** (Render SSH or Render Dashboard
  shell).

This means health checks from other Render services pass, and you can connect
to the running application through an SSH tunnel.

What is blocked:

- All public HTTP/HTTPS traffic to the service's custom domains.
- All public HTTP/HTTPS traffic to the service's `.onrender.com` subdomain.
- Inbound webhooks from external providers (Paddle, Brevo, etc.) — they come
  from the public internet and are blocked.

### Limitations relevant to Plantour

Render's built-in maintenance mode blocks everything from the public internet,
including inbound webhooks from payment and email providers. For routine
deployments and testing windows, this is fine. For extended maintenance where
you need webhooks to continue working, use the in-app maintenance middleware
described in `production-maintenance-steps.md` instead of Render's native
toggle.

Both approaches can be combined: Render's toggle for infrastructure-level
emergencies; the in-app middleware for normal deployment maintenance windows
where webhook continuity matters.

---

## 2. What Render Does for SEO During Maintenance

### The 503 response

When Render's maintenance mode is on, it returns `503 Service Unavailable` for
every public request. The `503` status code is the correct signal for search
engines. It tells crawlers:

> This is a temporary outage. Come back later. Do not deindex this URL.

Google, Bing, and other crawlers treat `503` as temporary and do not remove
pages from their index for a reasonable maintenance window.

### What Render does automatically

- Returns `503` for all public requests. This is the right SEO behaviour.
- The `.onrender.com` subdomain is also blocked, so there is no duplicate-content
  issue from a secondary URL remaining accessible.

### What Render does NOT do automatically

Render's built-in maintenance mode does not add a `Retry-After` header to
the `503` response. `Retry-After` is an optional but recommended header that
tells crawlers when to retry.

Handle this in your application:

- The in-app maintenance middleware in `production-maintenance-steps.md` adds
  a `Retry-After` header. Use it.
- Alternatively, if you use a custom maintenance static site, there is no way
  to add `Retry-After` from a static site.

### What Render does NOT give you

- Render's maintenance mode does not let specific paths bypass the maintenance
  block. Routes like `/robots.txt`, `/sitemap.xml`, and payment webhooks are
  blocked along with everything else.

If these routes must stay reachable, do not use Render's native maintenance
toggle. Use the in-app middleware instead.

### Additional SEO precautions on the Render side

1. **Do not disable the `onrender.com` subdomain** before your custom domain is
   confirmed and working. Once you add a custom domain and verify it, Render
   continues to serve both unless you manually disable the `.onrender.com`
   subdomain. Leave it enabled during the transition.

2. **Keep the production robots.txt correct before you open the site.** Your
   production `robots.txt` must say `Allow: /` and must not have `noindex` or
   `Disallow: /`. Verify this before disabling maintenance mode.

3. **Remove `noindex` meta tags before launch.** The `production.md` file
   lists the QA-specific items to remove. Do this before disabling maintenance
   mode.

4. **Do not set a permanent redirect (301) to a maintenance page.** Render's
   maintenance mode returns `503` not a redirect. This is correct. Do not try
   to work around it using redirects or rewrites that point all traffic to a
   maintenance URL.

---

## 3. Accessing the Real Production App During Maintenance

Because Render's maintenance mode keeps the service running and accessible via
SSH, you can test the real production application through an SSH tunnel while
the public sees the maintenance page.

### How SSH tunnel access works

Render's maintenance mode blocks the HTTP/HTTPS route from the public internet.
SSH is a separate channel that Render keeps open regardless of maintenance state.

By opening an SSH tunnel from your local machine to the running production
service, you forward a local port on your machine directly to the port the
application is listening on inside the container.

Your browser connects to `localhost:XXXX`. That connection travels through the
SSH tunnel to the production container. Render's maintenance mode intercept does
not apply, because the connection arrives via the SSH channel, not via the
public HTTP route.

### Step-by-step: open an SSH tunnel to the frontend

```
ssh -L 4200:localhost:4000 srv-YOURSERVICEID@ssh.oregon.render.com
```

- Replace `srv-YOURSERVICEID` with your frontend service ID from the Render
  Dashboard.
- Replace `4000` with the port your Angular SSR service listens on inside
  the container (check your start command).
- Replace `oregon` with your service region if different (ohio, virginia,
  frankfurt, singapore).

Leave this terminal open. In your browser, open `http://localhost:4200`.
You are now accessing the real production frontend.

### Step-by-step: open an SSH tunnel to the backend

```
ssh -L 5000:localhost:10000 srv-YOURAPISERVICEID@ssh.oregon.render.com
```

- Replace `10000` with the port your .NET API listens on (Render uses 10000
  by default for web services).
- Access the API locally at `http://localhost:5000`.

### Render Dashboard shell

If you only need to run a quick command or check a log, open the shell directly
in the Render Dashboard:

1. Open the service in the Render Dashboard.
2. Click the Shell tab.
3. Run any command inside the running container.

This does not require an SSH key setup and works immediately for ad hoc checks.

---

## 4. Step-by-Step: First Production Deployment (SEO-Safe)

This covers the complete flow from QA running to production open.

### Phase A. Create production services in Render

1. In the Render Dashboard, create a new project or a new environment inside an
   existing project. Name it `Production`.

2. Create a Render PostgreSQL instance on the Hobby plan.
   - Configure automated daily backups.
   - Store the connection string securely in a password manager.
   - Do NOT reuse the QA database.

3. Create a paid web service for the backend (.NET API / Docker).
   - Service type: Web Service.
   - Source: your GitHub repo, branch `main` (or your production branch).
   - Link it to the `Production` environment.
   - Add all production environment variables, including the database connection
     string for the production PostgreSQL instance.
   - Set the health check path to `/health`.
   - Set the start command.
   - Do NOT enable auto-deploys yet.

4. Create a paid web service for the frontend (Angular SSR).
   - Service type: Web Service.
   - Source: your GitHub repo, same branch.
   - Link it to the `Production` environment.
   - Add all production environment variables (API base URL pointing to the
     production backend service URL, not QA).
   - Set the health check path to `/health`.
   - Do NOT enable auto-deploys yet.

5. Add your custom domain to the frontend service.
   - In the frontend service Settings, open Custom Domains.
   - Add `plantour.app` and `www.plantour.app`.
   - Render will give you CNAME values to configure with your DNS provider.

6. Add your custom domain to the backend service if applicable.

7. Configure DNS at your DNS provider using the CNAME records from Render.

8. Return to the Render Dashboard and click Verify for each custom domain.
   Wait until verification succeeds and Render shows a valid TLS certificate.

9. To speed up DNS propagation verification, flush the public DNS cache:
   - Google: https://developers.google.com/speed/public-dns/cache
   - OpenDNS: https://cachecheck.opendns.com/

### Phase B. Enable maintenance mode before any public access

Do this before you make either service reachable to the public.

1. Go to the production frontend service Settings.
   Scroll to Maintenance Mode. Enable it.

2. Go to the production backend service Settings.
   Scroll to Maintenance Mode. Enable it.

3. Confirm the frontend returns `503` by visiting your custom domain in a browser.
   You must see a maintenance page, not your application.

4. Confirm the backend returns `503` by calling a public endpoint via curl or
   a browser.

The public cannot access your production services. Your maintenance mode is
the gatekeeper from this point forward.

Note: if you want to keep in-app maintenance middleware active for later
maintenance windows (so webhooks keep working), also set the `MaintenanceMode`
environment variable to `Enabled: true` in your production environment
variables on Render. But for this first deployment, Render's native toggle is
sufficient.

### Phase C. Deploy from GitHub to production

1. In the production backend service, click Manual Deploy > Deploy latest commit.
   Wait for the deploy to succeed in the Events timeline.

2. In the production frontend service, click Manual Deploy > Deploy latest commit.
   Wait for the deploy to succeed.

3. If the backend deploy includes database migrations, watch the pre-deploy
   command logs to confirm migrations ran successfully.

4. If either deploy fails, read the build logs. The old version continues to run
   if there was a previous successful deploy. For a brand-new service, you must
   fix the issue and redeploy.

### Phase D. Apply the production database schema

If you are not running migrations automatically via the pre-deploy command:

1. Open the Render Dashboard shell for the backend service, or open an SSH
   tunnel to the backend.
2. Run your database migration command manually from inside the container.
3. Confirm all tables and indexes exist.

### Phase E. Test through SSH tunnel while maintenance mode stays on

1. Open an SSH tunnel to the frontend:
   ```
   ssh -L 4200:localhost:4000 srv-FRONTENDID@ssh.REGION.render.com
   ```

2. Open an SSH tunnel to the backend in a separate terminal if needed:
   ```
   ssh -L 5000:localhost:10000 srv-BACKENDID@ssh.REGION.render.com
   ```

3. Test your production application thoroughly from `http://localhost:4200`.
   At this point you are using the real production database, real production
   environment variables, and the real production build. The public still sees
   the maintenance page.

4. Test critical user flows: registration, login, touring, payment, emails.

5. Test that `robots.txt` at `http://localhost:4200/robots.txt` shows
   `Allow: /` with no `Disallow: /` and no `noindex`.

6. Test that `sitemap.xml` is reachable and returns valid XML.

7. Confirm there is no `X-Robots-Tag: noindex` in the HTTP response headers.

8. Confirm the "non-production environment" banner is not visible in production.

### Phase F. Remove QA-specific items before going live

These are the items listed in `production.md`:

1. Remove `<meta name="robots" content="noindex, nofollow">` from the
   production HTML template.

2. Remove `X-Robots-Tag: noindex, nofollow` from server response headers.
   Verify by running:
   ```
   curl -I http://localhost:4200
   ```
   Confirm the header is absent.

3. Confirm the production `robots.txt` file does not contain `Disallow: /`.

4. Confirm the "non-production environment - test data only" banner is not
   shown in any production environment variable or feature flag.

Deploy again if any of these changes require a code push.

### Phase G. Open the production site to the public

1. Disable maintenance mode on the production frontend service:
   - Settings > Maintenance Mode > Toggle off > Confirm.

2. Disable maintenance mode on the production backend service:
   - Settings > Maintenance Mode > Toggle off > Confirm.

3. Visit `https://plantour.app` in a fresh browser window (not the SSH tunnel).
   Confirm you see the real production frontend.

4. Confirm the HTTP status is `200 OK`:
   ```
   curl -I https://plantour.app
   ```

5. Submit your sitemap to Google Search Console if you have not already done so.

6. Request indexing for the homepage in Google Search Console.

---

## 5. Ongoing Maintenance Windows

This covers any future maintenance after the initial production launch.

### When to use Render's native maintenance mode

Use Render's toggle when:

- You need to take the site fully offline for infrastructure work (database
  migrations, server upgrades, full redeployment from a fresh state).
- You accept that inbound webhooks (Paddle, Brevo) will be blocked temporarily.

### When to use the in-app maintenance middleware instead

Use the in-app middleware when:

- You need to keep payment or email webhooks receiving events.
- You want to keep `robots.txt` and `sitemap.xml` reachable.
- You want to access the real app via a bypass token without SSH tunneling.

See `production-maintenance-steps.md` for the in-app middleware implementation.

### How to temporarily suspend the website with Render's toggle

**To stop the website:**

1. Open the Render Dashboard.
2. Go to the production frontend service > Settings > Maintenance Mode.
3. Toggle it on. Confirm.
4. Repeat for the backend service.

The public sees `503 Service Unavailable` immediately. The services remain
running. You can still access them via SSH.

**To restart / reopen the website:**

1. Open the Render Dashboard.
2. Go to the production frontend service > Settings > Maintenance Mode.
3. Toggle it off. Confirm.
4. Repeat for the backend service.

The public can access the site immediately. No redeploy is required.

### SEO checklist for any maintenance window

Before enabling maintenance mode:

- [ ] Confirm in-app `Retry-After` header is configured (even if using Render's
       toggle, implement it in app code for when you switch to in-app mode
       later).

While in maintenance mode:

- [ ] Keep the window as short as possible. A few hours is safe. Days are
       manageable but accumulate crawl slowdown risk.
- [ ] Do not change your domain DNS to anything that returns `200 OK` with a
       redirect to a maintenance page. That looks like a content removal to
       crawlers.
- [ ] Do not add `noindex` to the maintenance response. Render's default `503`
       has no `noindex`, which is correct.

After disabling maintenance mode:

- [ ] Verify `200 OK` from the homepage via curl.
- [ ] Check no `noindex` headers or tags returned.
- [ ] Check `robots.txt` is reachable and correct.
- [ ] Check `sitemap.xml` is reachable and valid.

---

## 6. Reference: Render Docs Links Used in This Document

- Maintenance mode: https://render.com/docs/maintenance-mode
- Deploying on Render: https://render.com/docs/deploys
- Custom domains: https://render.com/docs/custom-domains
- SSH and shell access: https://render.com/docs/ssh
- Projects and environments: https://render.com/docs/projects
- Health checks: https://render.com/docs/health-checks
- Private network: https://render.com/docs/private-network
