# SEO Related Code: Production vs Non-Production

This document lists code fragments where SEO behavior changes by environment.

## 1) Environment Name Normalization (controls all IsProduction checks)

Source: plantour-server/Program.cs

Code fragment:

    static string NormalizeAspNetEnvironmentName(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw))
        {
            return Environments.Production;
        }

        return raw.Trim().ToLowerInvariant() switch
        {
            "dev" => Environments.Development,
            "development" => Environments.Development,
            "qa" => "QA",
            "pred-prod" => "Pred-Prod",
            "predprod" => "Pred-Prod",
            "preprod" => "Pred-Prod",
            "production" => Environments.Production,
            "prod" => Environments.Production,
            _ => raw.Trim()
        };
    }

Why SEO-relevant:
- All downstream checks like environment.IsProduction() and !environment.IsProduction() depend on this mapping.

How to test:
- Local:
  1. Start API with ASPNETCORE_ENVIRONMENT=qa.
  2. Check endpoints that rely on IsProduction (see sections below) and confirm non-production behavior.
  3. Repeat with ASPNETCORE_ENVIRONMENT=production and confirm production behavior.
- QA:
  1. Confirm deployed env variable is qa.
  2. Verify QA endpoints from sections below act as non-production.
- Production:
  1. Confirm deployed env variable is production or prod.
  2. Verify production endpoints from sections below act as production.

## 2) API Sitemap Endpoint: Only Available in Production

Source: plantour-server/Controllers/SitemapController.cs

Code fragment:

    [HttpGet("/sitemap.xml")]
    public async Task<IActionResult> GetSitemap()
    {
        if (!environment.IsProduction())
        {
            return NotFound();
        }

        var urls = await GetSitemapEntriesAsync();
        ...
        return File(xmlBytes, "application/xml; charset=utf-8");
    }

Why SEO-relevant:
- Non-production API environments do not expose sitemap.xml.
- Production API returns real sitemap XML.

How to test:
- Local API:
  1. Run API with ASPNETCORE_ENVIRONMENT=Development.
  2. GET http://localhost:<api-port>/sitemap.xml
  3. Expect: HTTP 404.
  4. Restart with ASPNETCORE_ENVIRONMENT=production.
  5. GET http://localhost:<api-port>/sitemap.xml
  6. Expect: HTTP 200 and XML body containing <urlset>.
- QA API:
  1. GET https://qaapi.plantour.app/sitemap.xml
  2. Expect: HTTP 404.
- Production API:
  1. GET https://api.plantour.app/sitemap.xml
  2. Expect: HTTP 200 and XML body.

## 3) API robots.txt: Allow in Production, Disallow in Non-Production

Source: plantour-server/Controllers/SitemapController.cs

Code fragment:

    [HttpGet("/robots.txt")]
    public IActionResult GetRobots()
    {
        List<string> lines = environment.IsProduction() ?
            [
                "User-agent: *",
                "Allow: /",
                "Disallow: /sign-in",
                "Disallow: /sign-in/participant",
                "Disallow: /signin-token",
                "Disallow: /search",
                $"Sitemap: {ToAbsoluteUrl(requestBase, "/sitemap.xml")}"
            ]
            :
            [
                "User-agent: *",
                "Disallow: /"
            ];

        return Content(payload, "text/plain; charset=utf-8");
    }

Why SEO-relevant:
- Crawling policy is environment-specific.

How to test:
- Local API:
  1. Run in Development.
  2. GET http://localhost:<api-port>/robots.txt
  3. Expect: User-agent: * and Disallow: /.
  4. Run in production.
  5. GET http://localhost:<api-port>/robots.txt
  6. Expect: Allow rules and Sitemap line.
- QA API:
  1. GET https://qaapi.plantour.app/robots.txt
  2. Expect: Disallow: /.
- Production API:
  1. GET https://api.plantour.app/robots.txt
  2. Expect: Allow list + Sitemap URL.

## 4) API Global X-Robots-Tag Header: Added Outside Production

Source: plantour-server/Program.cs

Code fragment:

    if (!app.Environment.IsProduction())
    {
        app.Use(async (context, next) =>
        {
            context.Response.Headers.Append("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");
            await next();
        });
    }

Why SEO-relevant:
- Entire API response surface is marked noindex in non-production.

How to test:
- Local API:
  1. Run in Development.
  2. GET any endpoint, for example /robots.txt.
  3. Expect response header X-Robots-Tag: noindex, nofollow, noarchive, nosnippet.
  4. Run in production.
  5. GET same endpoint.
  6. Expect header absent (unless another layer adds it).
- QA API:
  1. GET https://qaapi.plantour.app/robots.txt -I
  2. Expect X-Robots-Tag present.
- Production API:
  1. GET https://api.plantour.app/robots.txt -I
  2. Expect X-Robots-Tag absent.

## 5) SSR Global X-Robots-Tag: Non-Production Pages Are Noindex

Source: plantour-client/src/server.ts

Code fragment:

    app.use((req, res, next) => {
      if (environment.environment !== 'production' || isAuthPage(req.path)) {
        res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
      }
      next();
    });

Why SEO-relevant:
- In non-production SSR, all pages get noindex header.
- In production SSR, auth pages still get noindex.

How to test:
- Local SSR:
  1. Run client in development SSR mode.
  2. GET http://localhost:<client-port>/
  3. Expect X-Robots-Tag present.
  4. For auth page, GET /sign-in and expect X-Robots-Tag present.
- QA client:
  1. GET https://qa.plantour.app/
  2. Expect X-Robots-Tag present (environment is qa).
- Production client:
  1. GET https://plantour.app/
  2. Expect no X-Robots-Tag on public page.
  3. GET https://plantour.app/sign-in
  4. Expect X-Robots-Tag present.

## 6) SSR robots.txt: Production Allows Crawling, Non-Production Blocks

Source: plantour-client/src/server.ts

Code fragment:

    app.get('/robots.txt', (req, res) => {
      const lines = environment.environment === 'production'
        ? [
            'User-agent: *',
            'Allow: /',
            'Disallow: /sign-in',
            'Disallow: /sign-in/participant',
            'Disallow: /signin-token',
            `Sitemap: ${baseUrl}/sitemap.xml`,
          ]
        : [
            'User-agent: *',
            'Disallow: /',
          ];
    });

Why SEO-relevant:
- Client domain robots behavior differs by environment.

How to test:
- Local SSR:
  1. GET http://localhost:<client-port>/robots.txt
  2. Expect Disallow: /.
  3. Build/run with production config.
  4. GET /robots.txt and expect Allow + Sitemap.
- QA client:
  1. GET https://qa.plantour.app/robots.txt
  2. Expect Disallow: /.
- Production client:
  1. GET https://plantour.app/robots.txt
  2. Expect Allow + Sitemap.

## 7) SSR Sitemap Generation Uses Environment-Dependent Base URL

Source: plantour-client/src/server.ts and plantour-client/src/environments/environment*.ts

Code fragments:

    function resolveBaseUrl(req?: express.Request): string {
      ...
      return environment.clientUrl.replace(/\/+$/, '');
    }

    app.get('/sitemap.xml', (req, res) => {
      const baseUrl = resolveBaseUrl(req);
      const xml = buildSitemapXml(buildSitemapEntries(baseUrl));
      ...
    });

    // environment.prod.ts
    clientUrl: 'https://plantour.app'

    // environment.qa.ts and environment.pred-prod.ts
    clientUrl: 'https://qa.plantour.app'

Why SEO-relevant:
- Same sitemap route emits different absolute URLs depending on environment host/clientUrl.

How to test:
- Local SSR:
  1. GET http://localhost:<client-port>/sitemap.xml
  2. Confirm <loc> entries start with localhost (or forwarded host when proxied).
- QA client:
  1. GET https://qa.plantour.app/sitemap.xml
  2. Confirm <loc> entries use https://qa.plantour.app.
- Production client:
  1. GET https://plantour.app/sitemap.xml
  2. Confirm <loc> entries use https://plantour.app.

## 8) Build-Time robots.txt File Selection by Configuration

Source: plantour-client/angular.json plus public robots files

Code fragments:

- production build copies robots.txt from public/production
- qa build copies robots.txt from public/qa
- pred-prod build copies robots.txt from public/pred-prod
- development build currently copies robots.txt from public/qa

And files:
- public/production/robots.txt:
  User-agent: *
  Allow: /
  Sitemap: https://plantour.app/sitemap.xml

- public/qa/robots.txt:
  User-agent: *
  Disallow: /

- public/pred-prod/robots.txt:
  User-agent: *
  Disallow: /

Why SEO-relevant:
- If static assets are served directly, selected robots.txt controls crawl policy.

How to test:
- Local:
  1. Build each config:
     - ng build --configuration development
     - ng build --configuration qa
     - ng build --configuration production
  2. Check generated dist robots.txt and compare content.
- QA:
  1. Confirm deployment uses QA build configuration.
  2. GET https://qa.plantour.app/robots.txt and verify Disallow: /.
- Production:
  1. Confirm deployment uses production build configuration.
  2. GET https://plantour.app/robots.txt and verify Allow + Sitemap.

## Quick verification commands

Use curl (PowerShell examples):

    curl.exe -i https://qaapi.plantour.app/sitemap.xml
    curl.exe -i https://api.plantour.app/sitemap.xml
    curl.exe -i https://qa.plantour.app/robots.txt
    curl.exe -i https://plantour.app/robots.txt
    curl.exe -I https://qa.plantour.app/
    curl.exe -I https://plantour.app/sign-in

Expected at a glance:
- QA/non-production: sitemap often blocked or noindex; robots usually Disallow: /.
- Production: public pages/indexable paths allowed, sitemap available and referenced.
