# Maintenance API IIS deployment

This document describes how to deploy `plantour-maintenance-server` to local IIS on Windows.

Official Microsoft references:

- https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/iis/?view=aspnetcore-10.0
- https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/iis/hosting-bundle?view=aspnetcore-10.0

## Preconditions

Before configuring IIS, make sure the machine has:

1. IIS installed and running.
2. The .NET Hosting Bundle installed.
3. .NET 10 runtime installed.
4. The ASP.NET Core Module present at `C:\Program Files\IIS\Asp.Net Core Module\V2\aspnetcorev2.dll`.

This project also requires `ASPNETCORE_ENVIRONMENT` to be explicitly set to one of these values:

- `Development`
- `QA`
- `Production`

If that variable is missing or invalid, the app throws during startup.

## Step 1. Publish the API

Open PowerShell and run:

```powershell
dotnet publish C:\Projects\plantour\plantour-maintenance-server\plantour-maintenance-server.csproj `
  -c Release `
  -o C:\inetpub\plantour-maintenance-api
```

Expected result:

1. The publish command finishes successfully.
2. The folder `C:\inetpub\plantour-maintenance-api` exists.
3. The folder contains at least these files:
   - `plantour_maintenance_server.exe`
   - `web.config`
   - `appsettings.Development.json`
   - `appsettings.Production.json`
   - `appsettings.QA.json`

## Step 2. Verify the published app outside IIS

Before involving IIS, confirm the published app starts on its own.

In PowerShell:

```powershell
Set-Location C:\inetpub\plantour-maintenance-api
$env:ASPNETCORE_ENVIRONMENT = "Development"
$env:ASPNETCORE_URLS = "http://localhost:5099"
.\plantour_maintenance_server.exe
```

Open another terminal and run:

```powershell
curl http://localhost:5099/users/health-check
```

Expected result:

1. The executable stays running.
2. The console shows normal ASP.NET startup logs.
3. The health-check endpoint returns a successful response.

If this step fails, do not move to IIS yet. Fix the app startup problem first.

## Step 3. Stop the test process

If the API is still running from Step 2, stop it before binding IIS to the same port.

Expected result:

1. The console-hosted app exits.
2. Port `5099` is no longer occupied by the manually started process.

## Step 4. Create the IIS application pool

Open IIS Manager.

Create a new application pool with these settings:

1. Name: `PlantourMaintenanceApi`
2. .NET CLR version: `No Managed Code`
3. Managed pipeline mode: `Integrated`
4. Start application pool immediately: enabled

Why this matters:

- ASP.NET Core runs through the ASP.NET Core Module and its own process.
- IIS should not try to host it with the old managed CLR pipeline.

Expected result:

1. The new app pool appears in IIS.
2. Its status is `Started`.

## Step 5. Set the environment in web.config

Open this file:

`C:\inetpub\plantour-maintenance-api\web.config`

Inside the `aspNetCore` element, ensure there is an `environmentVariables` section like this:

```xml
<environmentVariables>
  <environmentVariable name="ASPNETCORE_ENVIRONMENT" value="Development" />
</environmentVariables>
```

If `environmentVariables` already exists, only add or update the `ASPNETCORE_ENVIRONMENT` entry.

Expected result:

1. `web.config` contains `ASPNETCORE_ENVIRONMENT`.
2. The value is one of `Development`, `QA`, or `Production`.

## Step 6. Create the IIS site

In IIS Manager, create a new site with these values:

1. Site name: `PlantourMaintenanceApi`
2. Application pool: `PlantourMaintenanceApi`
3. Physical path: `C:\inetpub\plantour-maintenance-api`
4. Type: `http`
5. IP address: `All Unassigned`
6. Port: `5099`
7. Host name: leave empty

Expected result:

1. The site appears in IIS.
2. The site status is `Started`.
3. The app pool status remains `Started`.

## Step 7. Verify the site through IIS

Run:

```powershell
curl http://localhost:5099/users/health-check
```

Expected result:

1. The request succeeds.
2. The response matches the successful result from the direct executable test.

You can also browse to:

```text
http://localhost:5099/users/health-check
```

## Step 8. If IIS fails, inspect the real error

Typical failure signals:

1. `500.30` means the ASP.NET Core app failed to start.
2. `500.31` usually means a runtime/hosting issue.
3. `403` usually indicates an IIS configuration or permissions issue.

Check these places:

1. Browser error page or `curl` output.
2. Windows Event Viewer.
3. IIS site status and app pool status.
4. The published `web.config`.
5. Whether the site folder and files actually match the latest publish.

## Recommended troubleshooting order

Use this order to avoid losing time on the wrong layer:

1. Publish the app.
2. Start the published executable directly.
3. Verify the health-check endpoint.
4. Configure IIS app pool.
5. Configure `web.config` environment variable.
6. Create the IIS site.
7. Verify the health-check endpoint through IIS.

## Notes specific to this API

1. The API startup requires `ASPNETCORE_ENVIRONMENT` to be set.
2. Valid values are only `Development`, `QA`, and `Production`.
3. The app loads `appsettings.{Environment}.json` and does not fall back to a generic `appsettings.json` during startup.
4. Testing the published executable before IIS is the fastest way to separate app startup errors from IIS configuration errors.