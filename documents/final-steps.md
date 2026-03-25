# Plantour: Domain Migration Final Steps
## Switch from `plantour-client-production.onrender.com` → `plantour.app`

---


## Overview

The production code is already configured for `plantour.app` (see `appsettings.Production.json`).
This guide gets the services live under the real domain with zero public downtime using Render's
Maintenance Mode as a safety gate and a local hosts-file tunnel for pre-cutover verification.

**Services involved:**
| Service | Render internal URL | New custom domain |
|---|---|---|
| Frontend (Angular SSR) | `plantour-client-production.onrender.com` | `plantour.app` + `www.plantour.app` |
| Backend (ASP.NET) | `plantour-server-production.onrender.com` *(your actual name)* | `api.plantour.app` |

---

## Phase 0 — Database
Recreate the Rebder.plantour_production_db.plantour schema using SQL scripts. Use 4-production-settings.sql at the final step.



## Phase 1 — Pre-flight Checklist

Before touching DNS, verify the code is correct.

### 1.1 Production settings already confirmed correct
- ✅ `appsettings.Production.json` → `SignInEmail.BaseUrl` = `https://plantour.app/signin-token`
- ✅ `appsettings.Production.json` → `CorsSettings.AllowedOrigins` includes `https://plantour.app` and `https://api.plantour.app`
- ✅ `public/production/robots.txt` → `Sitemap: https://plantour.app/sitemap.xml`
- ✅ Backend `SitemapController` generates canonical URLs using the incoming request host (picks up the new domain automatically once DNS points there)
- ✅ Frontend `server.ts` suppresses `X-Robots-Tag` only in non-production environments
- ✅ `Brevo` sender address is already `admin@plantour.app`

### 1.2 Check your Angular environment file for the API base URL
Open `plantour-client/src/environments/environment.production.ts` and confirm the `apiBaseUrl`
is either `https://api.plantour.app` or uses a relative `/api` proxy path.
If it still says `plantour-server-production.onrender.com`, update it now and redeploy before
proceeding.

### 1.3 Check the frontend `APP_BASE_HREF` / SSR canonical base
Confirm no hardcoded `plantour-client-production.onrender.com` strings remain in the codebase:

```powershell
cd c:\Projects\plantour
Get-ChildItem plantour-client/src -Recurse -Include *.ts,*.html | Select-String "onrender.com"
Get-ChildItem plantour-server -Recurse -Include *.cs,*.json | Select-String "onrender.com"
```

Fix any hits before proceeding.

---

## Phase 2 — Enable Maintenance Mode

### 2.1 Enable on both Render services

1. In Render Dashboard → **plantour-client** service → **Settings** tab → scroll to
   **Maintenance Mode** → click **Enable**.
2. Repeat for **plantour-server** service.

> Render will serve its generic maintenance page to visitors.  
> Health check (`/health`) continues to respond so Render does not stop the instance.

Keep maintenance mode **on** until Phase 6 testing passes.

---

## Phase 3 — Add Custom Domains in Render

### 3.1 Frontend service: `plantour.app` and `www.plantour.app`

1. Render Dashboard → **plantour-client** → **Custom Domains** → **Add Custom Domain**.
2. Add `plantour.app`. Render shows a **verification value** and a **target** (e.g.,
   `plantour-client-production.onrender.com` or an `onrender.com` CNAME target).
   Copy the exact target value.
3. Add `www.plantour.app`. Render will show the same CNAME target.

### 3.2 Backend service: `api.plantour.app`

1. Render Dashboard → **plantour-server** → **Custom Domains** → **Add Custom Domain**.
2. Add `api.plantour.app`. Copy the CNAME target shown (usually
   `plantour-server-production.onrender.com` or a dedicated `onrender.com` address).

> Render provisions a free Let's Encrypt TLS certificate automatically once the DNS record is
> verified. No manual cert work needed.

---

## Phase 4 — Configure DNS in Namecheap

Go to **Namecheap Dashboard** → **Domain List** → `plantour.app` → **Manage** →
**Advanced DNS** tab.

### 4.1 Apex domain (`plantour.app`)

Namecheap supports **ALIAS** records (also shown as "ANAME" in some providers) for the root
(`@`) which are required because a bare apex cannot be a CNAME under RFC.

| Type | Host | Value | TTL |
|---|---|---|---|
| ALIAS | `@` | *(CNAME target from Render for plantour.app)* | Automatic |

> If Namecheap does not show ALIAS, use their **URL Redirect Record** pointing `@` → `https://www.plantour.app` and in parallel add a CNAME for `www`. But ALIAS is cleaner — it will be in the dropdown in Advanced DNS.

### 4.2 `www` subdomain

| Type | Host | Value | TTL |
|---|---|---|---|
| CNAME | `www` | *(CNAME target from Render for www.plantour.app)* | Automatic |

### 4.3 API subdomain

| Type | Host | Value | TTL |
|---|---|---|---|
| CNAME | `api` | *(CNAME target from Render for api.plantour.app)* | Automatic |

### 4.4 Email / SPF (if sending email from `admin@plantour.app` via Brevo)

Brevo requires you to add SPF, DKIM, and DMARC records so emails from `admin@plantour.app`
are not marked spam. In Namecheap Advanced DNS:

| Type | Host | Value |
|---|---|---|
| TXT | `@` | `v=spf1 include:sendinblue.com ~all` |
| TXT | `mail._domainkey` | *(DKIM value from Brevo Senders & Domains → your domain → DKIM)* |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:admin@plantour.app` |

> Get the exact Brevo DKIM key: Brevo Dashboard → **Senders & IP** → **Domains** → your domain → **Authenticate**.

### 4.5 Remove legacy records

Delete any old A or CNAME records for `@` or `www` that pointed elsewhere.
Do **not** delete MX records if you have email configured.

---

## Phase 5 — Update Third-Party OAuth / Webhook Providers

These services maintain allowlists. They will silently reject the new domain until updated.

### 5.1 Google OAuth

1. [console.cloud.google.com](https://console.cloud.google.com) → your project → **APIs & Services** → **Credentials** → your OAuth 2.0 client.
2. Under **Authorised JavaScript origins** add:
   - `https://plantour.app`
3. Under **Authorised redirect URIs** add (if using server-side Google callback):
   - `https://api.plantour.app/api/auth/google/callback` *(adjust path to match your route)*
4. Save.

### 5.2 Facebook / Meta App

1. [developers.facebook.com](https://developers.facebook.com) → your app → **Settings** → **Basic**.
2. Under **App Domains** add `plantour.app`.
3. Go to **Facebook Login** → **Settings** → **Valid OAuth Redirect URIs** and add the new callback URL if applicable.
4. Save changes.

### 5.3 Cloudflare Turnstile

1. [dash.cloudflare.com](https://dash.cloudflare.com) → **Turnstile** → your widget.
2. Under **Allowed hostnames** add `plantour.app` (and `www.plantour.app` if needed).
3. Save.

### 5.4 Paddle

1. [vendors.paddle.com](https://vendors.paddle.com) → **Developer Tools** → **Approved URLs** (or **Allowed Domains** depending on Paddle plan).
2. Add `https://plantour.app`.
3. If using Paddle webhooks, update the webhook endpoint URL to `https://api.plantour.app/api/paddle/webhook` *(adjust path as needed)*.

### 5.5 Switch Paddle from Sandbox → Live in `appsettings.Production.json`

> **Current state:** `appsettings.Production.json` still points at `sandbox-api.paddle.com` with a sandbox API key. This must be updated before real payments can be processed.

1. In Paddle Dashboard (live account) → **Developer Tools** → **Authentication** → generate or copy your **live API key**.
2. Open `plantour-server/appsettings.Production.json` and update the `PaddleSettings` block:

```json
"PaddleSettings": {
  "ApiBaseUrl": "https://api.paddle.com/",
  "ApiKey": "<your-live-paddle-api-key>"
}
```

3. Do **not** commit the live API key to source control — inject it as an environment variable or Render secret at deploy time and remove the key value from the JSON file (leave it blank or use a placeholder).
4. Redeploy the backend service and confirm the Paddle integration works against the live environment.



---

## Phase 6 — Test via Local Hosts-File Tunnel (Before DNS Propagation)

DNS propagation can take minutes to hours. This step lets you test the full new-domain
experience from your own machine before the world sees it.

### 6.1 Find the IP address of your Render frontend service

```powershell
Resolve-DnsName plantour-client-production.onrender.com -Type A | Select-Object -ExpandProperty IPAddress
```

Copy one of the returned IPv4 addresses (e.g. `216.24.57.x`).

### 6.2 Edit Windows hosts file

Open **Notepad as Administrator** → File → Open → `C:\Windows\System32\drivers\etc\hosts`
(change filter to "All Files").

Add at the bottom:

```
# Plantour domain test — REMOVE AFTER DNS PROPAGATES
216.24.57.x    plantour.app
216.24.57.x    www.plantour.app
```

> Replace `216.24.57.x` with the actual IP from step 6.1.

### 6.3 Flush DNS cache

```powershell
ipconfig /flushdns
```

### 6.4 Test through the tunnel

Now `https://plantour.app` on your machine goes directly to Render's frontend service with
the correct `Host` header, so Render routes it as the custom domain. TLS is valid because
Render already provisioned the cert in Phase 3.

**Checklist while in maintenance mode:**

```
GET https://plantour.app/health
  → 200 OK  (frontend alive)

GET https://api.plantour.app/health   (if backend health endpoint exists)
  → 200 OK

GET https://plantour.app/robots.txt
  → User-agent: *
  → Sitemap: https://plantour.app/sitemap.xml
  (NOT the onrender.com address)

GET https://plantour.app/sitemap.xml
  → valid XML with <loc> entries using https://plantour.app/...
  (NOT onrender.com URLs)

Check response headers on https://plantour.app/:
  X-Robots-Tag header should NOT be present in production
  (it is only appended in non-production environments in server.ts)
```

In a browser (still with hosts file active, maintenance mode still **on**):

- Visit `https://plantour.app` → you should see Render's maintenance page (or your custom one)
  — proving the domain is routed correctly.
- Temporarily disable maintenance mode in Render for **your IP only** is not possible natively,
  so use the backend directly: call `https://api.plantour.app/api/...` endpoints directly via
  curl or Postman to confirm the API is responding.
- After you are satisfied, proceed to Phase 7.

### 6.5 Cleanup hosts file

Once Phase 7 is done and real DNS has propagated, remove the lines you added and flush again:

```powershell
ipconfig /flushdns
```

---

## Phase 7 — Final SEO & Production Verification

### 7.1 robots.txt

```
GET https://plantour.app/robots.txt
```

Expected response body:
```
User-agent: *
Allow: /
Disallow: /sign-in
Disallow: /sign-in/participant
Disallow: /signin-token
Sitemap: https://plantour.app/sitemap.xml
```

- Verify the `Sitemap:` line uses `https://plantour.app/` not the old Render URL.
- Verify the Content-Type header is `text/plain`.

### 7.2 sitemap.xml

```
GET https://plantour.app/sitemap.xml
```

- All `<loc>` entries must start with `https://plantour.app/`.
- No `<loc>` entry should contain `onrender.com`.
- The sitemap should list public template/search pages plus help, legal, and landing pages.
- Validate at [https://www.xml-sitemaps.com/validate-xml-sitemap.html](https://www.xml-sitemaps.com/validate-xml-sitemap.html)

### 7.3 Response headers (production SEO posture)

Check headers on a public page (e.g. `GET https://plantour.app/`):

| Header | Expected in Production |
|---|---|
| `X-Robots-Tag` | **Must NOT be present** (only set in dev/QA/pred-prod) |
| `Cache-Control` | Check value is reasonable (e.g. `no-store` for SSR dynamic, `max-age` for static assets) |
| `Strict-Transport-Security` | Present via Render/Cloudflare (HSTS) |
| `X-Frame-Options` | `DENY` or `SAMEORIGIN` — confirm it's present |
| `Content-Security-Policy` | Confirm it's set and does not block legitimate resources after domain change |

Check headers on an **auth page** (e.g. `GET https://plantour.app/sign-in`):

| Header | Expected |
|---|---|
| `X-Robots-Tag` | `noindex, nofollow, noarchive, nosnippet` *(enforced by server.ts for auth routes)* |

### 7.4 Canonical URLs

Open the rendered HTML of a public page (e.g. a public template detail page):
```powershell
(Invoke-WebRequest https://plantour.app/t/some-slug).Content | Select-String -Pattern 'canonical' -CaseSensitive:$false
```

The `<link rel="canonical">` tag must point to `https://plantour.app/t/some-slug`
and not to the old Render URL.

### 7.5 Open Graph / Social sharing metadata

```powershell
(Invoke-WebRequest https://plantour.app/).Content | Select-String -Pattern 'og:' -CaseSensitive:$false
```

`og:url` must be `https://plantour.app/` (not onrender.com).

### 7.6 Google Search Console

1. Go to [search.google.com/search-console](https://search.google.com/search-console) → **Add property** → enter `https://plantour.app`.
2. Choose **Domain** verification or **URL prefix** (URL prefix is simpler with a TXT record in Namecheap).
3. After verification, submit the sitemap: **Sitemaps** → `https://plantour.app/sitemap.xml`.

### 7.7 HTTPS / TLS

Confirm no mixed content:
```
GET https://plantour.app/
```
Browser DevTools → Console — no "Mixed Content" warnings.
All API calls must go to `https://api.plantour.app`, not `http://`.

### 7.8 Email sign-in link

Trigger a sign-in email to yourself and verify the link in the email reads
`https://plantour.app/signin-token?...` (from `SignInEmail.BaseUrl` in
`appsettings.Production.json`).

---

## Phase 8 — Disable Maintenance Mode

1. Render Dashboard → **plantour-client** → **Settings** → Maintenance Mode → **Disable**.
2. Render Dashboard → **plantour-server** → **Settings** → Maintenance Mode → **Disable**.
3. Verify `https://plantour.app` loads the live app (not the maintenance page).
4. Do a quick smoke test: sign in, create a trip, check the dashboard.

---

## Phase 9 — Post-Launch Tidy-Up

### 9.1 Update Pred-Prod sign-in email base URL
`appsettings.Pred-Prod.json` → `SignInEmail.BaseUrl` still points to the old Render URL
(`https://plantour-client-production.onrender.com/signin-token`).
Decide if Pred-Prod should continue to route sign-in emails to the Render URL (as a safety net)
or be updated. Currently the production app is the one that matters — just note this for future
Pred-Prod testing.

### 9.2 Hostname-based redirects (optional but good for SEO)
If Google has already indexed `plantour-client-production.onrender.com/*` pages, add a
Render redirect rule or application middleware that issues a `301` from the old `.onrender.com`
host to `https://plantour.app{path}`. This preserves any existing link equity.

### 9.3 Remove the hosts-file tunnel entries
(See Phase 6.5 above — flush DNS after removing the lines.)

### 9.4 Monitor logs for 24 hours
- Render Dashboard → **Logs** on both services — look for auth rejections, CORS errors, or
  unusual 4xx/5xx spikes that indicate a misconfigured origin.
- Check Brevo for any send/bounce spikes on email flows.

---

## Quick-Reference DNS Table (Namecheap Advanced DNS)

| Type | Host | Value | Purpose |
|---|---|---|---|
| ALIAS | `@` | `<render-cname-for-plantour.app>` | Apex → Render frontend |
| CNAME | `www` | `<render-cname-for-www.plantour.app>` | www → Render frontend |
| CNAME | `api` | `<render-cname-for-api.plantour.app>` | API subdomain → Render backend |
| TXT | `@` | `v=spf1 include:sendinblue.com ~all` | Brevo SPF |
| TXT | `mail._domainkey` | `<brevo-dkim-value>` | Brevo DKIM |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:admin@plantour.app` | DMARC |
| TXT | `@` | `<google-search-console-verification>` | Google SC ownership |

---

## Checklist Summary

- [ ] No hardcoded `onrender.com` URLs in source code
- [ ] Angular production environment file uses `https://api.plantour.app`
- [ ] Maintenance mode enabled on both Render services
- [ ] Custom domains added in Render for both services (frontend + backend)
- [ ] Namecheap DNS records added (ALIAS, WWW CNAME, API CNAME, SPF, DKIM, DMARC)
- [ ] Google OAuth → authorised origins updated
- [ ] Facebook App → authorised domains updated
- [ ] Cloudflare Turnstile → allowed hostnames updated
- [ ] Paddle → approved URLs updated, webhook URL updated
- [ ] Paddle → `appsettings.Production.json` switched from sandbox (`sandbox-api.paddle.com`) to live (`api.paddle.com`) with a live API key
- [ ] Hosts-file tunnel test passed (health, robots.txt, sitemap.xml, headers)
- [ ] `robots.txt` returns `Sitemap: https://plantour.app/sitemap.xml`
- [ ] `sitemap.xml` has no `onrender.com` URLs
- [ ] No `X-Robots-Tag` on public production pages
- [ ] `X-Robots-Tag: noindex` present on `/sign-in`, `/sign-in/participant`, `/signin-token`
- [ ] Canonical tags use `plantour.app`
- [ ] Email sign-in link uses `https://plantour.app/signin-token`
- [ ] Maintenance mode disabled
- [ ] Smoke test: sign in, dashboard, trip creation
- [ ] Google Search Console property added + sitemap submitted
- [ ] Hosts-file tunnel entries removed + `ipconfig /flushdns`
