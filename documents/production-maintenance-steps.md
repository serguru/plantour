# Plantour Production Maintenance Implementation Steps

This file is not a theory document.

It is an implementation guide for the current Plantour codebase as it exists now.

It tells you:

1. which files already exist;
2. which files you need to create;
3. where to insert code;
4. what code to paste;
5. how to verify that it works.

Important:

1. line numbers move every time the file changes;
2. because of that, this guide uses exact search markers such as `app.UseAuthentication();` and `app.get('**', ...)` so you can always find the correct insertion point;
3. where I know the current location from the source, I mention it.

## 1. What Already Exists In This Repo

You already have these pieces:

1. Frontend SSR entry point: `plantour-client/src/server.ts`
2. Frontend production robots file: `plantour-client/public/production/robots.txt`
3. Angular production asset config: `plantour-client/angular.json`
4. Backend startup entry point: `plantour-server/Program.cs`
5. Backend middleware folder: `plantour-server/Middleware/`
6. Backend sitemap endpoint: `plantour-server/Controllers/SitemapController.cs`
   - current route: `[HttpGet("/sitemap.xml")]`
7. Frontend health endpoint already exists in `plantour-client/src/server.ts`
   - current route: `/health`

What does not appear to exist yet in source:

1. backend maintenance middleware;
2. backend health endpoint;
3. frontend maintenance page logic;
4. frontend maintenance login / bypass logic;
5. frontend header forwarding for API bypass.

## 2. What You Are Going To Build

You are going to implement this model:

1. Public frontend returns a branded `503` maintenance page.
2. Public frontend sends `Retry-After`.
3. Public users cannot use the API during maintenance.
4. You can still access the real frontend through a private bypass flow.
5. The frontend sends a maintenance bypass token to the backend in a custom header.
6. `robots.txt`, `/sitemap.xml`, and `/health` stay reachable.

## 3. Backend Step 1: Add Maintenance Settings

Edit these files:

1. `plantour-server/appsettings.Development.json`
2. `plantour-server/appsettings.QA.json`
3. `plantour-server/appsettings.Production.json`

Add this block at the root JSON level:

```json
"MaintenanceMode": {
  "Enabled": false,
  "RetryAfterSeconds": 3600,
  "BypassHeaderName": "X-Maintenance-Access",
  "SharedSecret": "",
  "AllowedPaths": [
    "/health",
    "/sitemap.xml",
    "/robots.txt",
    "/api/paddle/webhook",
    "/api/brevo/webhook"
  ]
}
```

Notes:

1. Replace webhook paths with your real webhook routes.
2. In production, do not hardcode `SharedSecret` in the file.
3. In Render, set `MaintenanceMode__SharedSecret` as an environment variable.

## 4. Backend Step 2: Create A Settings Class

Create a new file:

`plantour-server/Models/MaintenanceModeOptions.cs`

Paste this code:

```csharp
namespace PlantourApi.Models;

public sealed class MaintenanceModeOptions
{
    public bool Enabled { get; set; }
    public int RetryAfterSeconds { get; set; } = 3600;
    public string BypassHeaderName { get; set; } = "X-Maintenance-Access";
    public string SharedSecret { get; set; } = string.Empty;
    public string[] AllowedPaths { get; set; } = [];
}
```

## 5. Backend Step 3: Create Maintenance Middleware

Create a new file:

`plantour-server/Middleware/MaintenanceModeMiddleware.cs`

Paste this code:

```csharp
using Microsoft.Extensions.Options;
using PlantourApi.Models;

namespace PlantourApi.Middleware;

public sealed class MaintenanceModeMiddleware
{
    private readonly RequestDelegate _next;
    private readonly MaintenanceModeOptions _options;

    public MaintenanceModeMiddleware(
        RequestDelegate next,
        IOptions<MaintenanceModeOptions> options)
    {
        _next = next;
        _options = options.Value;
    }

    public async Task Invoke(HttpContext context)
    {
        if (!_options.Enabled)
        {
            await _next(context);
            return;
        }

        var path = context.Request.Path.Value ?? string.Empty;

        if (IsAllowedPath(path) || HasBypassHeader(context.Request))
        {
            await _next(context);
            return;
        }

        context.Response.StatusCode = StatusCodes.Status503ServiceUnavailable;
        context.Response.Headers["Retry-After"] = _options.RetryAfterSeconds.ToString();
        context.Response.ContentType = "application/json";

        await context.Response.WriteAsJsonAsync(new
        {
            code = "MAINTENANCE_MODE",
            message = "Plantour is temporarily under maintenance. Please try again later."
        });
    }

    private bool IsAllowedPath(string path)
    {
        if (string.IsNullOrWhiteSpace(path))
        {
            return false;
        }

        return _options.AllowedPaths.Any(allowed =>
            path.Equals(allowed, StringComparison.OrdinalIgnoreCase) ||
            path.StartsWith(allowed + "/", StringComparison.OrdinalIgnoreCase));
    }

    private bool HasBypassHeader(HttpRequest request)
    {
        if (string.IsNullOrWhiteSpace(_options.SharedSecret))
        {
            return false;
        }

        if (!request.Headers.TryGetValue(_options.BypassHeaderName, out var headerValue))
        {
            return false;
        }

        return string.Equals(
            headerValue.ToString(),
            _options.SharedSecret,
            StringComparison.Ordinal);
    }
}
```

What this does:

1. blocks public API traffic when maintenance is enabled;
2. allows health, sitemap, robots, and webhook paths;
3. allows your private traffic when the shared header is present;
4. returns `503` plus `Retry-After`.

## 6. Backend Step 4: Create A Health Endpoint

The backend source snapshot does not show an existing health route.

Create a new file:

`plantour-server/Controllers/HealthController.cs`

Paste this code:

```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace plantour_server.Controllers;

[ApiController]
public class HealthController : ControllerBase
{
    [AllowAnonymous]
    [HttpGet("/health")]
    public IActionResult Get()
    {
        return Ok(new { status = "ok" });
    }
}
```

This gives Render a simple backend health check path.

## 7. Backend Step 5: Wire It Into Program.cs

Edit this file:

`plantour-server/Program.cs`

### 7.1 Register the options

Find this existing line:

```csharp
builder.Services.AddHttpContextAccessor();
```

Insert this block immediately below it:

```csharp
builder.Services.Configure<MaintenanceModeOptions>(
    builder.Configuration.GetSection("MaintenanceMode"));
```

### 7.2 Add the middleware to the pipeline

Find these existing lines near the end of the file:

```csharp
app.UseCors("AllowOrigins");

app.UseRateLimiter();
app.UseAuthentication();
app.UseMiddleware<CurrentUserMiddleware>();
```

Insert the maintenance middleware between `app.UseRateLimiter();` and `app.UseAuthentication();`:

```csharp
app.UseRateLimiter();
app.UseMiddleware<MaintenanceModeMiddleware>();
app.UseAuthentication();
```

Why here:

1. CORS is already applied.
2. Rate limiting still works.
3. Maintenance gate runs before auth and controller execution.
4. Blocked requests fail fast.

### 7.3 Add any missing `using`

If the file does not compile, add these imports near the top of `Program.cs`:

```csharp
using Microsoft.Extensions.Options;
using PlantourApi.Models;
using PlantourApi.Middleware;
```

`using PlantourApi.Middleware;` already appears to exist in the file, so you may only need `PlantourApi.Models`.

## 8. Frontend Step 1: Keep `robots.txt` Reachable

You already have this file:

`plantour-client/public/production/robots.txt`

You already have Angular build config copying it from `public/production` in:

`plantour-client/angular.json`

That means you do not need to invent a new `robots.txt` system.

Your frontend maintenance logic must not intercept `/robots.txt`.

## 9. Frontend Step 2: Add SSR Maintenance Gate In server.ts

Edit this file:

`plantour-client/src/server.ts`

You already have:

1. static file serving;
2. `/health` route;
3. catch-all SSR route using `app.get('**', ...)`.

You need to add maintenance logic before the existing catch-all route.

### 9.1 Add helper constants and functions

Near the top of the file, after `const angularAppEngine = new AngularNodeAppEngine();`, add this block:

```ts
const maintenanceEnabled = process.env['MAINTENANCE_MODE'] === 'true';
const maintenanceRetryAfter = process.env['MAINTENANCE_RETRY_AFTER_SECONDS'] ?? '3600';
const maintenanceSharedSecret = process.env['MAINTENANCE_SHARED_SECRET'] ?? '';
const maintenanceCookieName = 'plantour_maintenance_access';

function parseCookies(cookieHeader?: string): Record<string, string> {
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader
    .split(';')
    .map(part => part.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((result, part) => {
      const separatorIndex = part.indexOf('=');
      if (separatorIndex < 0) {
        return result;
      }

      const key = decodeURIComponent(part.slice(0, separatorIndex).trim());
      const value = decodeURIComponent(part.slice(separatorIndex + 1).trim());
      result[key] = value;
      return result;
    }, {});
}

function hasMaintenanceAccess(req: express.Request): boolean {
  if (!maintenanceSharedSecret) {
    return false;
  }

  const cookies = parseCookies(req.headers.cookie);
  return cookies[maintenanceCookieName] === maintenanceSharedSecret;
}

function renderMaintenanceHtml(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Plantour Maintenance</title>
    <style>
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: linear-gradient(135deg, #f4efe7, #dce8d8);
        color: #183a2d;
        font-family: Georgia, serif;
      }
      main {
        max-width: 720px;
        padding: 48px 32px;
        background: rgba(255,255,255,0.88);
        border-radius: 24px;
        box-shadow: 0 20px 60px rgba(24,58,45,0.18);
        text-align: center;
      }
      h1 { margin-top: 0; font-size: 2.4rem; }
      p { font-size: 1.1rem; line-height: 1.7; }
    </style>
  </head>
  <body>
    <main>
      <h1>Plantour is temporarily under maintenance</h1>
      <p>We are preparing production. Please check back soon.</p>
    </main>
  </body>
</html>`;
}
```

### 9.2 Add a maintenance login route for your private access

Insert this route after the existing `/health` route and before `app.get('**', ...)`:

```ts
app.get('/maintenance/login', (req, res) => {
  const secret = req.query['secret'];

  if (!maintenanceEnabled) {
    res.redirect('/');
    return;
  }

  if (!maintenanceSharedSecret || secret !== maintenanceSharedSecret) {
    res.status(403).send('Forbidden');
    return;
  }

  res.cookie(maintenanceCookieName, maintenanceSharedSecret, {
    httpOnly: false,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 12 * 60 * 60 * 1000,
  });

  res.redirect('/');
});
```

This gives you a private entry URL like:

```text
https://admin.plantour.app/maintenance/login?secret=YOUR_SHARED_SECRET
```

### 9.3 Add the public maintenance response

Insert this route after `/maintenance/login` and before `app.get('**', ...)`:

```ts
app.get('*', (req, res, next) => {
  if (!maintenanceEnabled) {
    next();
    return;
  }

  const alwaysAllowedPaths = ['/health', '/robots.txt', '/sitemap.xml', '/maintenance/login'];
  if (alwaysAllowedPaths.includes(req.path) || hasMaintenanceAccess(req)) {
    next();
    return;
  }

  res.setHeader('Retry-After', maintenanceRetryAfter);
  res.status(503).type('html').send(renderMaintenanceHtml());
});
```

This is the real answer to the previous vague instruction about `Retry-After`.

It means:

1. edit `plantour-client/src/server.ts`;
2. add `res.setHeader('Retry-After', maintenanceRetryAfter);`;
3. return `res.status(503)`;
4. do it in the SSR server before the Angular catch-all route.

## 10. Frontend Step 3: Forward The Maintenance Bypass Header To The API

Edit this file:

`plantour-client/src/app/interceptors/http-interceptor.ts`

Add this helper near the top of the file, below `addTokenHeader`:

```ts
const addMaintenanceHeader = (request: HttpRequest<any>) => {
    const maintenanceAccess = typeof localStorage !== 'undefined'
        ? localStorage.getItem('plantour_maintenance_access')
        : null;

    if (!maintenanceAccess) {
        return request;
    }

    return request.clone({
        headers: request.headers.set('X-Maintenance-Access', maintenanceAccess)
    });
}
```

Then change this block:

```ts
let authReq = req;
if (token) {
    authReq = addTokenHeader(req, token);
}
```

To this:

```ts
let authReq = addMaintenanceHeader(req);
if (token) {
    authReq = addTokenHeader(authReq, token);
}
```

Why this is needed:

1. frontend bypass gets you through the SSR gate;
2. backend bypass still needs a signal on API requests;
3. this header is that signal.

## 11. Frontend Step 4: Save The Bypass Token Into localStorage

The backend API bypass header reads from `localStorage`, so you need to store the token there after login.

The easiest implementation is to extend `/maintenance/login` in `plantour-client/src/server.ts` so it returns a tiny HTML page that writes to `localStorage` and redirects.

Replace the previous `res.redirect('/')` in `/maintenance/login` with this:

```ts
res.status(200).type('html').send(`<!doctype html>
<html lang="en">
  <body>
    <script>
      localStorage.setItem('plantour_maintenance_access', ${JSON.stringify(maintenanceSharedSecret)});
      window.location.replace('/');
    </script>
  </body>
</html>`);
```

That makes both of these work:

1. cookie for SSR maintenance bypass;
2. localStorage token for API header bypass.

## 12. Frontend Step 5: Keep `sitemap.xml` Reachable

Backend sitemap already exists in:

`plantour-server/Controllers/SitemapController.cs`

Its route is already:

```csharp
[HttpGet("/sitemap.xml")]
```

What you must do:

1. keep `/sitemap.xml` in backend `AllowedPaths`;
2. keep `/sitemap.xml` in frontend `alwaysAllowedPaths` if the public hostname serves it through the frontend pathing model;
3. test it explicitly after deployment.

## 13. Render Configuration Steps

In Render, add these environment variables to both frontend and backend services:

```text
MAINTENANCE_MODE=false
MAINTENANCE_RETRY_AFTER_SECONDS=3600
MAINTENANCE_SHARED_SECRET=generate-a-long-random-secret
```

For backend only, if you use config binding from ASP.NET configuration:

```text
MaintenanceMode__Enabled=false
MaintenanceMode__RetryAfterSeconds=3600
MaintenanceMode__BypassHeaderName=X-Maintenance-Access
MaintenanceMode__SharedSecret=generate-a-long-random-secret
```

Important:

1. frontend and backend must use the same shared secret;
2. production should start with maintenance on if you want a closed soft launch;
3. then set the value to `false` when you open to the public.

## 14. Cloudflare Access Steps

This part is not code, but it is still concrete.

1. Create DNS `admin.plantour.app` pointing to the frontend Render service.
2. Create DNS `api-admin.plantour.app` pointing to the backend Render service.
3. In Cloudflare Zero Trust, create an Access application for `admin.plantour.app`.
4. In Cloudflare Zero Trust, create an Access application for `api-admin.plantour.app`.
5. Restrict both apps to your email identity.
6. Use the admin hostname for your private maintenance login URL.

Do not rely only on the secret query string without Cloudflare Access.

## 15. Verification Steps You Can Actually Run

Use these after deployment.

### 15.1 Public frontend must return `503`

Run in PowerShell:

```powershell
$response = Invoke-WebRequest https://plantour.app -SkipHttpErrorCheck
$response.StatusCode
$response.Headers['Retry-After']
```

Expected:

1. status code is `503`;
2. `Retry-After` header is present.

### 15.2 Public `robots.txt` must return `200`

```powershell
(Invoke-WebRequest https://plantour.app/robots.txt).StatusCode
```

Expected:

```text
200
```

### 15.3 Public `sitemap.xml` must return `200`

```powershell
(Invoke-WebRequest https://plantour.app/sitemap.xml).StatusCode
```

Expected:

```text
200
```

### 15.4 Backend health must return `200`

```powershell
(Invoke-WebRequest https://api.plantour.app/health).StatusCode
```

Expected:

```text
200
```

### 15.5 Normal public API route must return `503`

Replace the sample route below with a real public API route:

```powershell
$response = Invoke-WebRequest https://api.plantour.app/api/trips -SkipHttpErrorCheck
$response.StatusCode
$response.Content
```

Expected:

1. status code is `503`;
2. body contains `MAINTENANCE_MODE`.

### 15.6 Bypass login must unlock the private app

1. Open `https://admin.plantour.app/maintenance/login?secret=YOUR_SHARED_SECRET`
2. Confirm the browser redirects to `/`
3. Open browser dev tools
4. Confirm localStorage contains `plantour_maintenance_access`
5. Confirm the `plantour_maintenance_access` cookie exists
6. Use the app
7. Confirm API calls now include header `X-Maintenance-Access`

## 16. Deployment Day Exact Order

Follow this order exactly.

1. Add backend maintenance config to all appsettings files.
2. Create `plantour-server/Models/MaintenanceModeOptions.cs`.
3. Create `plantour-server/Middleware/MaintenanceModeMiddleware.cs`.
4. Create `plantour-server/Controllers/HealthController.cs`.
5. Wire the maintenance middleware into `plantour-server/Program.cs`.
6. Build backend locally.
7. Edit `plantour-client/src/server.ts` to add maintenance constants, helpers, `/maintenance/login`, and public `503` handling.
8. Edit `plantour-client/src/app/interceptors/http-interceptor.ts` to forward `X-Maintenance-Access`.
9. Build frontend locally.
10. Configure Render environment variables.
11. Deploy frontend and backend.
12. Turn maintenance mode on.
13. Verify public `503`, `Retry-After`, `robots.txt`, `sitemap.xml`, and `/health`.
14. Use the private admin login URL.
15. Test the real production app while the public is blocked.
16. When ready, set maintenance off and redeploy if required.
17. Verify public pages return `200`.

## 17. The Short Version Of The Real Edits

If you want the minimum possible summary, this is it:

1. Create backend maintenance middleware in `plantour-server/Middleware/MaintenanceModeMiddleware.cs`.
2. Register its options in `plantour-server/Program.cs` right below `builder.Services.AddHttpContextAccessor();`.
3. Add the middleware in `plantour-server/Program.cs` between `app.UseRateLimiter();` and `app.UseAuthentication();`.
4. Create backend `/health` in `plantour-server/Controllers/HealthController.cs`.
5. In `plantour-client/src/server.ts`, add a maintenance gate before `app.get('**', ...)`.
6. In that gate, return `503` and set `Retry-After`.
7. In that same file, add `/maintenance/login` that sets a cookie and writes the token to `localStorage`.
8. In `plantour-client/src/app/interceptors/http-interceptor.ts`, send `X-Maintenance-Access` on API calls.
9. Keep `/robots.txt`, `/sitemap.xml`, and `/health` excluded from maintenance blocking.

That is the concrete implementation path for this repo.
