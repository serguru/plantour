# How To Use Plantour API Visits Geo Extension

## Important Path Note

This guide is stored in `documents/api-visits-vscode-extension`, but the actual extension project is currently located in:

`C:\Projects\plantour\api-visits-extension`

## What The Extension Does

The extension adds a simple VS Code workflow for viewing geolocated unique visitor IPs per UTC day from the `plantour.api_visits` table.

When you use it, the extension:

1. opens a tab inside VS Code
2. shows a form with `From` and `To` date fields
3. queries `plantour.api_visits` for that UTC day window
4. groups the result as unique `day + client IP` rows
5. geolocates each public client IP with the external geolocation API
6. shows the results in a table in the same tab

## How To Start The Extension

1. Open the workspace in VS Code.

2. Make sure the extension project dependencies are installed in:

`C:\Projects\plantour\api-visits-extension`

If needed, run:

```powershell
cd C:\Projects\plantour\api-visits-extension
npm install
```

3. Press `F5` in VS Code.

4. Choose the launch configuration:

`Run Plantour API Visits Geo Extension`

5. A new Extension Development Host window will open.

## How To Use The Extension After It Starts

In the Extension Development Host window, use one of these ways to open it:

1. Click the status bar button:

`API Visits Geo`

2. Or open the Command Palette and run:

`Plantour: API Visits Geolocation`

3. Or press:

`Ctrl+Alt+G`

After that:

1. Enter the `From` date.
2. Enter the `To` date.
3. Click `OK`.
4. Wait for the query and geolocation lookup to complete.
5. Review the results table in the same tab.

## What Data Is Shown

The result table shows one row per `UTC day + unique client IP` and includes:

- day
- client IP
- visit count for that day and IP
- first seen timestamp
- last seen timestamp
- country
- region
- city
- timezone
- ISP
- lookup status
- lookup error, if any

Days with no entries are not included in the result.

## How The DB Connection Works Now

The extension currently reads the PostgreSQL connection string only from this file:

the extension's user-local `appsettings.json` in VS Code global storage.

You can open it from the command palette with:

`Plantour: Open API Visits Geo Config`

On Windows, the file will typically be created under a path similar to:

`%APPDATA%\Code\User\globalStorage\plantour-local.plantour-api-visits-geo\appsettings.json`

Specifically, it reads:

`ConnectionStrings.DefaultConnection`

So the extension now has its own stable user-local appsettings-style file and does not require editing the server appsettings file or the packaged extension files.

## How To Replace The DB Connection String If Needed

If you want the extension to connect to a different database, change the value of:

`ConnectionStrings.DefaultConnection`

in this file:

the user-local `appsettings.json` opened by:

`Plantour: Open API Visits Geo Config`

Example:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=postgres;Username=postgres;Password=REPLACE_ME;SSL Mode=Disable"
  }
}
```

Replace that string with your other PostgreSQL connection string.

Example of another connection string:

```text
Host=my-server;Port=5432;Database=my-db;Username=my-user;Password=my-password;SSL Mode=Require;Trust Server Certificate=true
```

After changing it:

1. save `appsettings.json`
2. stop the current Extension Development Host if it is running
3. press `F5` again to start a fresh session
4. use the extension normally

## Important Notes

1. The extension does not currently show a DB connection form.

2. The extension does not currently support choosing Development, QA, or Production from its own UI.

3. Geolocation uses an external API, so internet access is required.

4. Private or local IP addresses such as `127.0.0.1` and `192.168.x.x` are skipped intentionally.

## Troubleshooting

### Extension opens but shows a DB error

Check that:

1. PostgreSQL is reachable from your machine.
2. The connection string in `appsettings.json` is correct.
3. The target database contains the `plantour.api_visits` table.

### Extension window starts but nothing happens on `OK`

Check the Extension Development Host notifications for an error message.

### Geolocation fields are empty

Possible reasons:

1. the IP is private or reserved
2. the external geolocation API request failed
3. the external service temporarily rate-limited the request