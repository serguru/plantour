# Maintenance client IIS deployment

This document describes how to deploy `plantour-maintenance-client` to local IIS on Windows and connect it to the locally published maintenance API.

Related API guide:

- `documents/maintenance-API-IIS-deployment.md`

## Deployment model used here

This setup assumes:

1. The maintenance API is already deployed to IIS.
2. The API is available at `http://localhost:5099`.
3. The maintenance client is served by IIS at `http://localhost:4204`.

The client uses a dedicated Angular build configuration named `local-iis`.

That build points the frontend to this API base URL:

```text
http://localhost:5099
```

## Important note about routing

This deployment uses Angular hash routing.

Examples:

- `http://localhost:4204/#/sign-in`
- `http://localhost:4204/#/users`
- `http://localhost:4204/#/logs`

Why this is used:

1. It avoids the need for the IIS URL Rewrite module.
2. IIS can serve the client as plain static files.
3. Client-side routes continue to work without server-side rewrite rules.

## Step 1. Build the client for local IIS

Open PowerShell and run:

```powershell
Set-Location C:\Projects\plantour\plantour-maintenance-client
npm run build:local-iis
```

Expected result:

1. The build finishes successfully.
2. The output folder is created at:

```text
C:\Projects\plantour\plantour-maintenance-client\dist\plantour-maintenance-client\browser
```

3. That folder contains at least:
   - `index.html`
   - `web.config`
   - `main-*.js`
   - `styles-*.css`
   - `assets\`

## Step 2. Confirm the build points to the local IIS API

This deployment depends on the `local-iis` environment configuration.

The expected API base URL is:

```text
http://localhost:5099
```

Expected result:

1. The maintenance API is already reachable at `http://localhost:5099/users/health-check`.
2. The client build was produced with the `local-iis` configuration.

## Step 3. Copy the built client to the IIS folder

Run:

```powershell
New-Item -ItemType Directory -Force -Path C:\inetpub\plantour-maintenance-client
Copy-Item `
  -Path C:\Projects\plantour\plantour-maintenance-client\dist\plantour-maintenance-client\browser\* `
  -Destination C:\inetpub\plantour-maintenance-client `
  -Recurse -Force
```

Expected result:

1. The folder `C:\inetpub\plantour-maintenance-client` exists.
2. It contains:
   - `index.html`
   - `web.config`
   - hashed JavaScript and CSS files
   - `assets\`

Important detail:

1. IIS must point to the copied folder in `C:\inetpub`.
2. Do not point IIS to the parent `dist\plantour-maintenance-client` folder.
3. The actual deployable static site content comes from the `browser` subfolder.

## Step 4. Verify the deployed web.config is simple static hosting

Open this file:

```text
C:\inetpub\plantour-maintenance-client\web.config
```

Expected result:

1. The file exists.
2. It does not contain a `<rewrite>` section.
3. It only contains static hosting configuration, including the `.webmanifest` MIME mapping.

Why this matters:

1. The current setup intentionally avoids the IIS URL Rewrite dependency.
2. If a rewrite section appears there, the deployment may fail on machines without the URL Rewrite module installed.

## Step 5. Create the IIS application pool

Open IIS Manager.

Create a new application pool with these settings:

1. Name: `PlantourMaintenanceClient`
2. .NET CLR version: `No Managed Code`
3. Managed pipeline mode: `Integrated`
4. Start application pool immediately: enabled

Expected result:

1. The new app pool appears in IIS.
2. Its status is `Started`.

## Step 6. Create the IIS site

In IIS Manager, create a new site with these values:

1. Site name: `PlantourMaintenanceClient`
2. Application pool: `PlantourMaintenanceClient`
3. Physical path: `C:\inetpub\plantour-maintenance-client`
4. Type: `http`
5. IP address: `All Unassigned`
6. Port: `4204`
7. Host name: leave empty

Expected result:

1. The site appears in IIS.
2. The site status is `Started`.
3. The app pool status remains `Started`.

## Step 7. Verify the client loads from IIS

Open:

```text
http://localhost:4204/
```

Expected result:

1. The Angular app loads.
2. IIS does not show `500.19`, `404`, or a directory listing.

Then verify a client route with hash routing:

```text
http://localhost:4204/#/sign-in
```

Expected result:

1. The sign-in page loads.
2. Refreshing the page still works because the route stays after `#` and does not require IIS rewrite rules.

## Step 8. Verify the client can call the published API

Open the maintenance client in the browser and use the sign-in flow.

Expected result:

1. Browser requests go to `http://localhost:5099`.
2. The API responds successfully.
3. There are no browser CORS errors.

Why this should work:

1. The client local IIS build targets `http://localhost:5099`.
2. The maintenance API Development configuration already allows `http://localhost:4204` in CORS.

## Troubleshooting

### If the client site fails with `500.19`

Check:

1. `C:\inetpub\plantour-maintenance-client\web.config` exists.
2. The file is valid XML.
3. The file does not contain an unexpected `<rewrite>` section from an older deployment.

### If the browser loads but API calls fail

Check:

1. The maintenance API site is running at `http://localhost:5099`.
2. `http://localhost:5099/users/health-check` responds successfully.
3. The browser developer tools Network tab shows requests going to `http://localhost:5099`.
4. The browser console does not show CORS errors.

### If you still see an old client build

Check:

1. The latest `local-iis` build was copied into `C:\inetpub\plantour-maintenance-client`.
2. Old hashed files are not being confused with a stale browser cache.
3. A hard refresh was performed in the browser.

## Recommended deployment order

Use this order to keep the failure surface small:

1. Deploy the maintenance API to IIS.
2. Verify `http://localhost:5099/users/health-check`.
3. Build the maintenance client with `npm run build:local-iis`.
4. Copy the `browser` output to `C:\inetpub\plantour-maintenance-client`.
5. Create the IIS app pool.
6. Create the IIS site on `http://localhost:4204`.
7. Verify `http://localhost:4204/`.
8. Verify `http://localhost:4204/#/sign-in`.
9. Verify browser requests reach the API at `http://localhost:5099`.